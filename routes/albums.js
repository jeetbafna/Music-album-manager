var express = require('express');
var router = express.Router();
var Firebase = require('firebase');
var fbRef = new Firebase('https://albumz-f5975.firebaseio.com/');
var multer = require('multer');
var upload = multer({dest:'./public/images/uploads'});

//Home page
router.get('/', function(req, res, next){
	var albumRef = fbRef.child('albums');

	albumRef.once('value', function(snapshot){
		var albums = [];
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key();
			var childData = childSnapshot.val();
			albums.push({
				id: key,
				artist: childData.artist,
				title: childData.title,
				genre: childData.genre,
				info: childData.info,
				label: childData.label,
				tracks: childData.tracks,
				year: childData.year,
				cover: childData.cover

			});
		});
		res.render('albums/index', {albums: albums});
	});

});

router.get('/add', function(req, res, next){
	var genreRef = fbRef.child('genres');

	genreRef.once('value', function(snapshot){
		var data = [];
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key();
			var childData = childSnapshot.val();
			data.push({
				id: key,
				name: childData.name
			});
		});
		res.render('albums/add', {genres: data});
	});
	
});

router.post('/add', upload.single('cover'), function(req, res, next){
	//CHeck file Upload
	if(req.file){
		console.log('Uploading File...');
		var cover = req.file.filename;
	} else{
		console.log('No file uploaded');
		var cover = 'noimage.jpg';
	}

	//Build album object
	var album = {
		artist: req.body.artist,
		title: req.body.title,
		genre: req.body.genre,
		info: req.body.info,
		year: req.body.year,
		label: req.body.label,
		tracks: req.body.tracks,
		cover: cover
	};

	//Create ref
	var albumRef = fbRef.child('albums');
	albumRef.push().set(album);

	req.flash('success_msg', 'Album Saved');
	res.redirect('/albums');

});

router.get('/details/:id', function(req, res){
	var id = req.params.id;

	var albumRef = new Firebase('https://albumz-f5975.firebaseio.com/albums/' +id);

	albumRef.once('value', function(snapshot){
		var album = snapshot.val();
		res.render('albums/details', {album: album, id:id});
	});
});

router.get('/edit/:id', function(req, res, next){
	var id = req.params.id;
	var albumRef = new Firebase('https://albumz-f5975.firebaseio.com/albums/'+id);

	var genreRef = fbRef.child('genres');

	genreRef.once('value', function(snapshot){
		var genres = [];
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key();
			var childData = childSnapshot.val();
			genres.push({
				id: key,
				name: childData.name
			});
		});
		albumRef.once('value', function(snapshot){
		var album = snapshot.val();
		res.render('albums/edit', {album: album, id:id, genres: genres});
	});
	});
});

router.post('/edit/:id', upload.single('cover'), function(req, res, next){
	var id = req.params.id;
	var albumRef = new Firebase('https://albumz-f5975.firebaseio.com/albums/'+id);

	//Check File Upload
	if(req.file){
		var cover = req.file.filename;

		albumRef.update({
		artist: req.body.artist,
		title: req.body.title,
		genre: req.body.genre,
		info: req.body.info,
		year: req.body.year,
		label: req.body.label,
		tracks: req.body.tracks,
		cover: cover
		});
	}
	else{
		//Update album without cover
		albumRef.update({
		artist: req.body.artist,
		title: req.body.title,
		genre: req.body.genre,
		info: req.body.info,
		year: req.body.year,
		label: req.body.label,
		tracks: req.body.tracks
		});
	}
	req.flash('success_msg', 'Album updated');
	res.redirect('/albums');
});



module.exports = router;