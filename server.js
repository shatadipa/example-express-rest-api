var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var morgan = require('morgan')
var Plan = require('./app/models/plan')
var fs = require('fs')
var FileStreamRotator = require('file-stream-rotator')

var app = express()
var logDirectory = __dirname + "/log"
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

var accessLogStream = FileStreamRotator.getStream({
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
})

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(morgan('combined', {
    stream: accessLogStream
}))

mongoose.connect('mongodb://localhost:27017/exampledb')

var port = process.env.PORT || 8080
var router = express.Router()

router.use(function (req, res, next) {
    console.log(req.params)
    next()
})

router.route('/plans')
    .post(function (req, res) {
        Plan.count({
            name: req.body.name
        }, function (err, count) {
            if (!count) {
                var plan = new Plan()
                plan.name = req.body.name
                plan.price = req.body.price
                plan.speed = req.body.speed

                plan.save(function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    }
                    return res.status(200).json({
                        message: 'Plan Created!'
                    })
                })
            } else {
                return res.status(400).json({
                    message: 'Duplicate!'
                })
            }
        });
    })
    .get(function (req, res) {
        Plan.find(function (err, plans) {
            if (err) {
                return res.status(500).json({
                    error: err
                })
            }
            return res.status(200).json(plans)
        })
    })

router.route('/plans/:id')
    .get(function (req, res) {
        Plan.findById(req.params.id, function (err, plan) {
            if (err) {
                return res.status(404).json({
                    error: err
                })
            }
            if (plan == null) {
                return res.status(404).json({
                    message: "Plan Not Found!"
                });
            } else {
                return res.status(200).json(plan);
            }
        })
    })
    .put(function (req, res) {
        Plan.findById(req.params.id, function (err, plan) {
            if (err)
                return res.status(404).json({
                    error: err
                })
            if (req.body.name)
                plan.name = req.body.name
            if (req.body.speed)
                plan.speed = req.body.speed
            if (req.body.price)
                plan.price = req.body.price
            plan.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: err
                    })
                }
                return res.status(200).json({
                    message: 'Plan Updated!'
                })
            })
        })
    })
    .delete(function (req, res) {
        Plan.remove({
            _id: req.params.id
        }, function (err, plan) {
            if (err) {
                return res.status(500).json({
                    error: err
                })
            }
            if (plan.result.n > 0) {
                return res.status(200).json({
                    message: 'Successfully Deleted!'
                })
            } else {
                return res.status(404).json({
                    message: 'Not found!'
                })
            }
        })
    })

router.get('/', function (req, res) {
    res.status(200).json({
        message: 'Hooray! welcome to our api'
    })
})

app.use('/api', router)

app.listen(port)
console.log('Magic happens on port ' + port);