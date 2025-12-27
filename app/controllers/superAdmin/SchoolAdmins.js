const{
    User,
    School,
    strongPasswordRegex
} = require('./utils');


exports.listSchoolAdmins = async (req, res) => {
  try {
    const schoolAdmins = await User.find({ role: 'school-admin' }).populate('schoolId');
    res.render('dashboard/super-admin/school-admin/list-school-admins', { schoolAdmins });
  } catch (err) {
    console.error(err);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات المدراء');
    res.redirect('/super-admin');
  }
};


exports.viewSchoolAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).populate('schoolId');
    if (!admin) {
      req.flash('error', 'المدير غير موجود');
      return res.redirect('/super-admin/school-admins');
    }
    res.render('dashboard/super-admin/school-admin/view-school-admin', { admin });
  } catch (err) {
    console.error(err);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات المدير');
    res.redirect('/super-admin/school-admins');
  }
};


exports.editSchoolAdminForm = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    const schools = await School.find({});
    if (!admin) {
      req.flash('error', 'المدير غير موجود');
      return res.redirect('/super-admin/school-admins');
    }
    res.render('dashboard/super-admin/school-admin/edit-school-admin', { admin, schools });
  } catch (err) {
    console.error(err);
    req.flash('error', 'حدث خطأ أثناء جلب بيانات المدير');
    res.redirect('/super-admin/school-admins');
  }
};

// Update school-admin
exports.updateSchoolAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ errors: { general: 'المدير غير موجود' } });
    }

    // Check for unique email
    if (req.body.email && req.body.email !== admin.email) {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.json({ errors: { email: 'البريد الإلكتروني مستخدم بالفعل' } });
      }
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;
    admin.schoolId = req.body.schoolId || admin.schoolId;

    await admin.save();
    res.json({ success: 'تم تحديث بيانات المدير بنجاح', redirect: '/super-admin/school-admins' });
  } catch (err) {
    console.error(err);
    res.json({ errors: { general: 'حدث خطأ أثناء تحديث بيانات المدير' } });
  }
};