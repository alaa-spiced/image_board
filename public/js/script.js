(function() {
    Vue.component('image-modal', {
        data: function () {
            return {
                image: '',
                title: '',
                usernameComment: '',
                comment: '',
                comments: []
            };
        },

        props: [ 'imageid' ],
        template: '#my-template',
        mounted: function () {
            var self = this;
            axios.get('/images/' + this.imageid)
                .then(function(res) {
                    self.image = res.data.image;
                    axios.get(/comments/ + self.imageid)
                        .then(function(res) {
                            self.comments = res.data.comments;
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        },
        watch: {
            imageid: function () {
                console.log("is working");
                var self = this;
                axios.get('/images/' + this.imageid)
                    .then(function(res) {
                        self.image = res.data.image;
                        axios.get(/comments/ + self.imageid)
                            .then(function(res) {
                                self.comments = res.data.comments;
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });

            }
        },
        methods: {
            closeImage: function () {
                this.$emit('nullifyid', null);
            },
            sendComment: function() {
                var self = this;
                axios.post('/uploadcomment', {
                    imageId: this.imageid,
                    comment: this.comment,
                    usernameComment: this.usernameComment
                }).then(function(res) {
                    if (res.data.success) {
                        self.comments.unshift(res.data.comment);

                    }
                });

            }
        }
    });
    var app = new Vue({
        el: '#main',
        data: {
            images: [],
            username: '',
            desc: '',
            title: '',
            imageFile: '',
            imageId: location.hash.slice(1),
            lastImage: 0,
            idFirstImage: 0
        },
        methods: {
            imageSelected: function(e) {
                this.imageFile = e.target.files[0];
                console.log(this.imageFile.name);
            },
            upload: function() {
                console.log(this.imageFile);
                var formData = new FormData;
                formData.append('file', this.imageFile);
                formData.append('title', this.title);
                formData.append('desc', this.desc);
                formData.append('username', this.username);
                axios.post('/upload', formData). then(function(res) {
                    if (res.data.success) {
                        console.log(res.data);
                        app.images.unshift(res.data.image);

                    }
                });
            },
            clickImage: function(id) {
                this.imageId = id;
                location.hash = this.imageId;
            },
            closeModal: function(arg) {
                this.imageId = arg;
                location.hash = '';
            },
            moreImages: function() {
                axios.get('/' + app.lastImage)
                    .then(function(res) {
                        console.log(res.data);
                        for (var i = 0; i < res.data.length; i++) {
                            app.images.push(res.data[i]);
                        }
                        app.lastImage = app.images[app.images.length - 1].id;
                    });
            }
        },
        mounted: function () {

            addEventListener('hashchange', function () {
                app.imageId = location.hash.slice(1);
                if (isNaN(app.imageId)) {
                    app.imageId = null;
                    location.hash = '';
                }
            });
            axios.get('/images/')
                .then(function(res) {
                    app.images = res.data;
                    app.lastImage = app.images[app.images.length - 1].id;
                    app.idFirstImage = app.images[0].id_first_image;
                });
        }
    });

})();
