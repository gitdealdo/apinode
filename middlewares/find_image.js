var Imagen = require("../models/imagenes");
var owner_check = require("./image_permissions");

module.exports = function (req,res,next) {
	Imagen.findById(req.params.id)
				.populate("creator")
				.exec(function (err, imagen) {
					if (imagen && owner_check(imagen,req,res)) {res.locals.imagen = imagen; next();}
					else{res.redirect("/api")}
				})
}