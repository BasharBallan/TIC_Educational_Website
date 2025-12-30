const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const getMessage = require('../utils/getMessage');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(getMessage('not_found', req.lang), 404));
    }

    res.status(200).json({
      status: 'success',
      message: getMessage(`${Model.modelName.toLowerCase()}_deleted`, req.lang),
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(new ApiError(getMessage('not_found', req.lang), 404));
    }

    document.save();
    res.status(200).json({
      status: 'success',
      message: getMessage(`${Model.modelName.toLowerCase()}_updated`, req.lang),
      data: document,
    });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      message: getMessage(`${Model.modelName.toLowerCase()}_created`, req.lang),
      data: newDoc,
    });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (populationOpt) query = query.populate(populationOpt);

    const document = await query;
    if (!document) {
      return next(new ApiError(getMessage('not_found', req.lang), 404));
    }

    res.status(200).json({
      status: 'success',
      message: getMessage(`${Model.modelName.toLowerCase()}_fetched`, req.lang),
      data: document,
    });
  });


exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) filter = req.filterObj;

    const documentsCounts = await Model.countDocuments();

    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate(documentsCounts);

    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res.status(200).json({
      status: 'success',
      message: getMessage(`${Model.modelName.toLowerCase()}_list`, req.lang),
      results: documents.length,
      paginationResult,
      data: documents,
    });
  });
