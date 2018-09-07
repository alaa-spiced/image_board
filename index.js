const express = require('express');
const app = express();
const db = require('./sql/db');
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require('./s3');
const config = require('./config');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});


app.post('/upload', uploader.single('file'), s3.upload, function(req, res) {
    db.addImage(
        req.body.title,
        req.body.desc,
        req.body.username,
        config.s3Url + req.file.filename
    ).then(image => {
        res.json ({
            success: true,
            image: image
        });
    });
});

app.get('/images/:id', (req, res ) => {
    db.getAnImage(req.params.id)
        .then(image => {
            res.json ({
                success: true,
                image: image
            });
        }).catch(err => {
            console.log(err);
        });

});
app.get('/comments/:imageid', (req, res ) => {
    db.getComments(req.params.imageid)
        .then(comments => {
            res.json ({
                success: true,
                comments: comments
            });
        }).catch(err => {
            console.log(err);
        });

});

app.get('/images', (req, res) => {
    db.getImages()
        .then(images => {
            res.json(images);
        }).catch(err => {
            console.log(err);
        });
});

app.get('/:lastimage', (req, res) => {
    db.getMoreImages(req.params.lastimage)
        .then(images => {
            res.json(images);
        }).catch(err => {
            console.log(err);
        });
});

app.post('/uploadcomment', function(req, res) {
    db.addComment(
        req.body.imageId,
        req.body.usernameComment,
        req.body.comment
    ).then(comment => {
        res.json ({
            success: true,
            comment: comment
        });
    });
});

app.listen(8080, () => {
    console.log("I'm Listening on port 8080");
});
