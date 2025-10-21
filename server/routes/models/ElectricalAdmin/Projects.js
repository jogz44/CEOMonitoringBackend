const mongoose = require("mongoose");

const ElectricalProjectsSchema = new mongoose.Schema({
  ProjectName: String,
  Location: {
    Barangay: String,
    Street: String,
  },
  ReferenceNo: String,
  MaterialCost: String,
  MaterialBalance: String,
  LaborCost: String,
  LaborBalance: String,
  Contingency: String,
  TotalProjectCost: String,
  NoOfDays: String,
  DateStarted: {
    type: Date,
    default: Date.now,
    get: function (value) {
      // Format the date as 'MM/DD/YYYY' when getting it
      return value
        ? `${(value.getMonth() + 1).toString().padStart(2, "0")}/${value
            .getDate()
            .toString()
            .padStart(2, "0")}/${value.getFullYear()}`
        : null;
    },
    set: function (value) {
      // You can perform additional validation or manipulation here
      return value;
    },
  },
  TargetAccomplishment: {
    type: Date,
    default: Date.now,
    get: function (value) {
      // Format the date as 'MM/DD/YYYY' when getting it
      return value
        ? `${(value.getMonth() + 1).toString().padStart(2, "0")}/${value
            .getDate()
            .toString()
            .padStart(2, "0")}/${value.getFullYear()}`
        : null;
    },
    set: function (value) {
      // You can perform additional validation or manipulation here
      return value;
    },
  },
  AccomplishmentPctg: String,
  ProjectIncharge: String,
  Status: String,
  IsDeleted: String,
  Remarks: String,
  MaterialsWithdrawn: [{
    MaterialName: String,
    Description: String,
    Quantity: String,
    Unit: String,
    Price:String,
    WithdrawOn: { type: Date, default: Date.now },
  }],
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "ElectricalProjectsInfos",
  ElectricalProjectsSchema
);
