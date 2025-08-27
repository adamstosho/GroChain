const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')
const Harvest = require('../models/harvest.model')

const harvestSchema = Joi.object({
  cropType: Joi.string().required(),
  quantity: Joi.number().required(),
  date: Joi.date().required(),
  geoLocation: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
  unit: Joi.string().valid('kg','tons','pieces','bundles','bags','crates').default('kg'),
  location: Joi.string().optional(),
  description: Joi.string().optional(),
  quality: Joi.string().valid('excellent','good','fair','poor').default('good'),
  images: Joi.array().items(Joi.string()).optional(),
}).unknown(true)

exports.createHarvest = async (req, res) => {
  try {
    const body = { ...req.body }
    if (!body.unit || typeof body.unit !== 'string' || body.unit.trim() === '') body.unit = 'kg'
    const { error, value } = harvestSchema.validate(body)
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message })
    const batchId = uuidv4()
    const harvest = await Harvest.create({ ...value, farmer: req.user.id, batchId })
    return res.status(201).json({ status: 'success', harvest })
  } catch (e) {
    console.error('createHarvest error:', e)
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getHarvests = async (req, res) => {
  try {
    const { cropType, status, page = 1, limit = 10 } = req.query
    const filter = { farmer: req.user.id }
    if (cropType) filter.cropType = new RegExp(String(cropType), 'i')
    if (status) filter.status = status
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [harvests, total] = await Promise.all([
      Harvest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Harvest.countDocuments(filter)
    ])
    return res.json({ status: 'success', harvests, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.getProvenance = async (req, res) => {
  try {
    const { batchId } = req.params
    let harvest = await Harvest.findOne({ batchId })
    if (!harvest && /^[a-fA-F0-9]{24}$/.test(String(batchId))) {
      harvest = await Harvest.findById(batchId)
    }
    if (!harvest) return res.status(404).json({ status: 'error', message: 'Harvest not found' })
    return res.json({ status: 'success', provenance: harvest })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

exports.verifyQRCode = async (req, res) => {
  try {
    const { batchId } = req.params
    let harvest = await Harvest.findOne({ batchId })
    if (!harvest && /^[a-fA-F0-9]{24}$/.test(String(batchId))) {
      harvest = await Harvest.findById(batchId)
    }
    if (!harvest) return res.status(404).json({ status: 'error', message: 'QR code verification failed - harvest not found' })
    
    // Return verification data
    const verificationData = {
      verified: true,
      batchId: harvest.batchId,
      cropType: harvest.cropType,
      harvestDate: harvest.date,
      quantity: harvest.quantity,
      unit: harvest.unit,
      quality: harvest.quality,
      location: harvest.location,
      farmer: harvest.farmer,
      status: harvest.status,
      verifiedAt: new Date()
    }
    
    return res.json({ status: 'success', data: verificationData })
  } catch (e) {
    console.error('QR verification error:', e)
    return res.status(500).json({ status: 'error', message: 'QR code verification failed' })
  }
}

exports.getProductProvenance = async (req, res) => {
  try {
    const { productId } = req.params
    
    // For now, we'll simulate product provenance by looking up harvests
    // In a real implementation, this would link to a product model
    const harvest = await Harvest.findById(productId)
    if (!harvest) return res.status(404).json({ status: 'error', message: 'Product not found' })
    
    const provenance = {
      productId: harvest._id,
      batchId: harvest.batchId,
      cropType: harvest.cropType,
      harvestDate: harvest.date,
      farmer: harvest.farmer,
      location: harvest.location,
      quality: harvest.quality,
      supplyChain: [
        {
          stage: 'harvest',
          date: harvest.date,
          location: harvest.location,
          actor: harvest.farmer,
          status: 'completed'
        }
      ]
    }
    
    return res.json({ status: 'success', data: provenance })
  } catch (e) {
    console.error('Product provenance error:', e)
    return res.status(500).json({ status: 'error', message: 'Failed to get product provenance' })
  }
}

exports.deleteHarvest = async (req, res) => {
  try {
    const { id } = req.params
    const harvest = await Harvest.findById(id)
    if (!harvest) return res.status(404).json({ status: 'error', message: 'Harvest not found' })
    if (String(harvest.farmer) !== req.user.id) return res.status(403).json({ status: 'error', message: 'Forbidden' })
    await harvest.deleteOne()
    return res.json({ status: 'success', message: 'Harvest deleted', data: { id } })
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

