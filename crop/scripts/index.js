
$(function(){

  var WHRatio = 0.75;
  var upPhotoUrl = "http://47.108.90.165:8080/api/headPhoto";
  // 图片处理功能
  function PictureEdit(){
    this.imageWrap = $('#J_upload_box');
    this.cropBox = $('#J_file_box');
    this.preImg = $('#J_file_box_img');
    this.cropImg = null;

    this.uploadBtn = $('#J_file');
    this.cropBtn = $('#J_crop');
    this.cancelCropBtn = $('#J_cancel');
    this.selectImg = false;
    this.pics = {};
    this.cropOption = {
       aspectRatio: WHRatio,
       viewMode:3
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

        window
        .lrz(file,{width: 300}) // 展示预览图
        .then(function (rst) {
          that.selectImg = true;
          that.showCropBox();

          that.preImg.load(function(){
            // 触发图像裁剪
            that.preImg.cropper(that.cropOption);
          });
          that.preImg.attr('src',rst.base64);

        })
        .catch(function (err) {
          that.hideCropBox();
          alert('读取图像失败！');
        })
        .always(function () {

        });
    });
  };

  // 显示裁剪框
  PictureEdit.prototype.showCropBox = function(){
    this.cropBox.show();
  };

  // 隐藏裁剪框
  PictureEdit.prototype.hideCropBox = function(){
    this.cropBox.hide();
    this.preImg.cropper('destroy');
  };


  // 处理上传图片(裁剪，缩放)
  PictureEdit.prototype.crop = function(){
    var that = this;
    // 取消裁剪
    that.cancel();
    // 确认上传
    that.cropBtn.click(function(){
      that.cropImg = that.preImg.cropper('getCroppedCanvas', { width: 200, height: 200 });
      if(!that.selectImg){
        alert("请先选择图片，再上传");
        return;
      }
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
    });
  };

  new PictureEdit();

});
