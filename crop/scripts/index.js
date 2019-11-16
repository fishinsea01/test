
$(function(){

  var WHRatio = 1;
  var upPhotoUrl = "http://47.108.90.165:8080/api/headPhoto";

  $("#start").click(function(){
    $(".first-page").hide();
    $(".second-page").show();
  });
  // 图片处理功能
  function PictureEdit(){
    this.imageWrap = $('#J_upload_box');
    this.cropBox = $('#J_file_box');
    this.preImg = $('#J_file_box_img');
    this.cropImg = null;
    this.cropper = new Cropper(document.getElementById("cropImg"), {
      aspectRatio: WHRatio,
      autoCropArea:1,
      minCropBoxWidth:100,
      minCropBoxHeight:100,
      viewMode:3
    });

    this.uploadBtn = $('#J_file');
    this.cropBtn = $('#J_crop');
    this.cancelCropBtn = $('#J_cancel');
    this.selectImg = false;
    this.pics = {};
    this.cropOption = {
       aspectRatio: WHRatio,
       //viewMode:3,
       autoCropArea:1
    };
    this.upload();
  }

  function uploadPicToService(pic) {
		$.ajax({
			type: "post",
			data: {
        uploadDto:pic
      },
      dataType: "json",
			url: upPhotoUrl,
			success: function(jsonData) {
				console.log(jsonData);

			},
			error: function(e) {
				console.log(e);
			},
			complete: function() {

			}
		});
	}

  // 选择上传图片
  PictureEdit.prototype.upload = function(){
    var that = this;
    that.crop();
    that.uploadBtn.change(function(){
        if (this.files.length === 0){
          return;
        }
        var file = this.files[0];
        var maxSize = 1024 * 1024 * 2;
        if(file.size > maxSize) {
          alert("上传图片不能大于2M");
          return;
        }

        var reader = new FileReader();  
        reader.onload = function(evt) {  
            that.selectImg = true;
            that.showCropBox();
            var replaceSrc = evt.target.result;  
            // 更换cropper的图片  
            that.cropper.replace(replaceSrc);
            that.cropper.setAspectRatio = WHRatio;
            that.preImg.attr("src",URL.createObjectURL(file));
            //$('#tailoringImg').cropper('replace', replaceSrc, false);// 默认false，适应高度，不失真  
        }  
        reader.readAsDataURL(file);  
        // window
        // .lrz(file,{width: 300}) // 展示预览图
        // .then(function (rst) {
        //   that.selectImg = true;
        //   that.showCropBox();

        //   var reader = new FileReader();  
        //   reader.onload = function(evt) {  
        //       var replaceSrc = evt.target.result;  
        //       // 更换cropper的图片  
        //       $('#tailoringImg').cropper('replace', replaceSrc, false);// 默认false，适应高度，不失真  
        //   }  
        //   reader.readAsDataURL(file.files[0]);  
        //   that.preImg.load(function(){
        //     // 触发图像裁剪
            
        //     that.cropper = new Cropper(that.preImg[0], that.cropOption);
        //   });
        //   that.preImg.attr('src',rst.base64);

        // })
        // .catch(function (err) {
        //   that.hideCropBox();
        //   alert('读取图像失败！');
        // })
        // .always(function () {

        // });
    });
  };

  // 显示裁剪框
  PictureEdit.prototype.showCropBox = function(){
    this.cropBox.show();
  };

  // 隐藏裁剪框
  PictureEdit.prototype.hideCropBox = function(){
    this.cropBox.hide();
    this.cropper.clear();
  };


  // 处理上传图片(裁剪，缩放)
  PictureEdit.prototype.crop = function(){
    var that = this;
    // 取消裁剪
    that.cancel();
    // 确认上传
    that.cropBtn.click(function(){
      if(!that.selectImg){
        alert("请先选择图片，再上传");
        return;
      }
      that.cropImg = that.cropper.getCroppedCanvas({ width: 200, height: 200 });
      var data = that.cropImg.toDataURL();
      console.log('data', data);
      var delStr = "data:image/png;base64,";
      uploadPicToService(data.substr(delStr.length));
    });

  };

  // 取消上传图片
  PictureEdit.prototype.cancel = function(){
    var that = this;
    that.selectImg = false;
    that.cancelCropBtn.click(function(){
      that.hideCropBox();
      $(".second-page").hide();
      $(".first-page").show();
    });
  };

  new PictureEdit();

});
