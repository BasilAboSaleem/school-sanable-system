const{
    Employee,
} = require("./utils");



exports.renderAddEmployeeForm = (req, res) => {
  res.render("dashboard/school-admin/employee/add-employee");
};

exports.createEmployee = async (req, res) => {
  try {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       req.flash("error", errors.array()[0].msg);
       return res.redirect("/school-admin/employees/create");
    }

    const { name, email, phone, jobTitle, address, salary } = req.body;
    const newEmployee = new Employee({
      name,
      email,
      phone,
      jobTitle,
      address,
      salary,
      schoolId: req.user.schoolId
    });
    await newEmployee.save();
    req.flash("success", "تم إضافة الموظف بنجاح");
    res.redirect("/school-admin/employees");
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء إضافة الموظف");
    res.redirect("/school-admin/employees");
  }
};

// عرض كل الموظفين
exports.listEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ schoolId: req.user.schoolId }).sort({ createdAt: -1 });
    res.render("dashboard/school-admin/employee/employees", { employees });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الموظفين");
    res.redirect("/dashboard");
  }
};

// صفحة تعديل الموظف
exports.renderEditEmployeeForm = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      req.flash("error", "الموظف غير موجود");
      return res.redirect("/school-admin/employees");
    }
    res.render("dashboard/school-admin/employee/edit-employee", { employee });
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء جلب بيانات الموظف");
    res.redirect("/school-admin/employees");
  }
};

// تحديث بيانات الموظف
exports.updateEmployee = async (req, res) => {
  try {
    const { name, email, phone, jobTitle, address, salary } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      req.flash("error", "الموظف غير موجود");
      return res.redirect("/school-admin/employees");
    }

    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.jobTitle = jobTitle || employee.jobTitle;
    employee.address = address || employee.address;
    if (salary !== undefined) employee.salary = salary;

    await employee.save();
    req.flash("success", "تم تحديث بيانات الموظف بنجاح");
    res.redirect("/school-admin/employees");
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء تحديث بيانات الموظف");
    res.redirect("/school-admin/employees");
  }
};

// حذف موظف
exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    req.flash("success", "تم حذف الموظف بنجاح");
    res.redirect("/school-admin/employees");
  } catch (err) {
    console.error(err);
    req.flash("error", "حدث خطأ أثناء حذف الموظف");
    res.redirect("/school-admin/employees");
  }
};