const spicedPg = require('spiced-pg');
var db;

if(process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg('postgres:postgres:postgres@localhost:5432/imageboard');
}

module.exports.getImages = function () {
    return db.query(`SELECT *, (
        SELECT id FROM images ORDER BY id ASC LIMIT 1
    ) as id_first_image FROM images ORDER BY id DESC LIMIT 8;`)
        .then(results => {
            return(results.rows);
        }).catch(err => {
            console.log(err);
        });
};

module.exports.getMoreImages = function (lastImage) {
    const q = `
        SELECT *, (
            SELECT id FROM images ORDER BY id ASC LIMIT 1
        ) as id_first_image FROM images WHERE id < $1 ORDER BY id DESC LIMIT 8
    `;
    const params = [lastImage];
    return db.query(q, params)
        .then(results => {
            return(results.rows);
        }).catch(err => {
            console.log(err);
        });
};


module.exports.getComments = function (imageId) {
    const q = `
    SELECT * FROM comments WHERE image_id = $1 ORDER BY id DESC
    `;
    const params = [imageId];
    return db.query(q, params)
        .then(results => {
            return(results.rows);
        }).catch(err => {
            console.log(err);
        });
};

module.exports.getAnImage = function (imageId) {
    const q =`
    SELECT *, (
        SELECT id FROM images WHERE id < $1 ORDER BY id DESC LIMIT 1
    ) as right_image, (
        SELECT id FROM images WHERE id > $1 ORDER BY id ASC LIMIT 1
    ) as left_image
    FROM images
    WHERE id = $1`;
    const params = [imageId];
    return db.query(q, params)
        .then(results => {
            return results.rows[0];
        }).catch(err => {
            console.log(err);
        });
};



module.exports.addImage = function (title, desc, user, url) {
    const q = `
        INSERT INTO images (title, description, username, url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
    `;
    const params = [ title || null , desc || null, user || null, url || null];
    return db.query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => {
            return Promise.reject(err);
        });
};

module.exports.addComment = function (imageId, username, comment) {
    const q = `
        INSERT INTO comments (image_id, username, comment)
            VALUES ($1, $2, $3)
            RETURNING *
    `;
    const params = [ imageId || null , username || null, comment || null];
    return db.query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => {
            return Promise.reject(err);
        });
};
