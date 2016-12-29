'use strict';
var express = require("express");
var Imagen = require("./models/imagenes");
var imagen_meddleware = require("./middlewares/find_image");
var router = express.Router();
var fs = require("fs-extra");

router.get("/", function (req, res) {
  Imagen.find({})
    .populate("creator")
    .exec(function (err,imagenes) {
      if (err) console.error(err);
      res.render("app/home",{imagenes});
    })
});

router.get("/imagenes/new",function (req, res) {
  res.render("app/imagen/form");
});
router.all("/imagenes/:id*",imagen_meddleware);

router.get('/imagenes/:id/edit', function (req,res) {
  res.render("app/imagen/edit");
});

router.route("/imagenes/:id")
  .get(function (req, res) {
    res.render("app/imagen/show");
  })
  .put(function (req, res) {
    res.locals.imagen.title = req.body.title;
    res.locals.imagen.save(function (err) {
      if (err) {res.redirect("/api/imagenes/"+req.params.id+"/edit");}
      else {res.render("app/imagen/show");}
    });
  })
  .delete(function (req, res) {
    Imagen.findOneAndRemove({_id:req.params.id},function (err) {
      if (!err) {res.redirect("/api/imagenes");}
      else{console.log(err);res.redirect("/api/imagenes"+req.params.id);}
    });
  });

router.route("/imagenes")
  .get(function (req, res) {
    Imagen.find({creator:res.locals.user._id}, function (err, imagenes) {
      if (err) {res.redirect("/api");return;}
      res.render("app/imagen/index", {imagenes:imagenes});
    });
  })
  .post(function (req, res) {
    console.log(req.body.archivo);
    var extension = req.body.archivo.name.split(".").pop();
    var data = {
      title:req.body.title,
      creator:res.locals.user._id,
      extension:extension
    }
    var imagen = new Imagen(data);
    imagen.save(function (err) {
      if (!err) {
        fs.copy(req.body.archivo.path,"public/imgs/"+imagen._id+"."+extension,function (err) {
          if (err) return console.error(err);
          console.log("success!")
          res.redirect("/api/imagenes/"+imagen._id);
        });
      }else {
        console.log(imagen);
        res.render(err);
      }
    });
  });

module.exports = router;