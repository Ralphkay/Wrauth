const helperFunc = require('./helper');

exports.findDocs = async Model => {
  return await Model.find();
};

exports.findDocById = async (Model, id) => {
  const doc = await Model.findById(id);
  return await doc.save();
};

exports.createDoc = async (Model, data) => {
  const doc = new Model(data);
  return await doc.save();
};

exports.updateDoc = async (Model, id, data) => {
  const doc = await Model.findById(id);
  const updatedDoc = Object.assign(doc, data);
  return await updatedDoc.save();
};

exports.deleteDoc = async (Model, id) => {
  const doc = await Model.findById(id);
  if (doc !== null) {
    doc.deleteOne();
  }
  return doc;
};

exports.findDocbyCustomAttr = async (Model, data) => {
  return await Model.findOne(data);
 
};
