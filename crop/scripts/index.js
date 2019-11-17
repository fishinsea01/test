
$(function(){

  var WHRatio = 1;
  var upPhotoUrl = "http://47.108.90.165:8080/api/headPhoto";
  var initPhoto = "";
  var initPhotoW = "";
  var initPhotoH = "";

  $("#start").click(function(){
    $(".first-page").hide();
    $(".second-page").show();
  });
  $(".sure-sel").click(function(){
    convert2canvas();
  });
  //弹框关闭
  $(".close").click(function(){
    $(".fourth-page").hide();
  });
  //选择相框
  $(".k-box div").click(function(){
    var index = $(this).index();
    selectPhotoFrame(index);
  });
  $("#showCancel").click(function(){
     $(".page").hide();
     $("#J_cancel").click();
  })
  init();
  window.onresize = function () {
    init();
  }

  function init(){
    var kImg = new Image();
    kImg.src = "images/sk21.png";
    var winW = $(window).width();
    kImg.onload = function(){
      var height = winW*0.74*kImg.naturalHeight/kImg.naturalWidth;
      console.log('heigth---',kImg.naturalWidth, kImg.naturalHeight,height);
      $(".pic-box").css("height",height);
    }
    selectPhotoFrame(0);
  }
  //选择相框
  function selectPhotoFrame(index){
    for(var i=0;i<4;i++){
      var kNum = i+1;
      if(i==index){
        $("#selK").attr("src","images/sk"+kNum+"1.png");
        $($(".k-box img")[i]).attr("src","images/k"+kNum+"_sel.png");
      }else{
        $($(".k-box img")[i]).attr("src","images/k"+kNum+".png");
      }
    }
  }
  function convert2canvas() {
    var pageObj = $('#mergeBox');
    var ele = pageObj[0];
    var width = ele.offsetWidth-1; //获取dom 宽度
    var height = ele.scrollHeight-1; 
    var canvas = document.createElement("canvas"); 
    var scale = 2;
    canvas.width = width * scale; 
    canvas.height = height * scale; 
    canvas.getContext("2d").scale(scale, scale);
    var opts = {
        scale: scale, // 添加的scale 参数
        canvas: canvas, //自定义 canvas
        width: width, //dom 原始宽度
        height: height,
        useCORS: true // 【重要】开启跨域配置
    };

    html2canvas(ele, opts).then(function (canvas) {
      var context = canvas.getContext('2d');
      // 【重要】关闭抗锯齿
      context.mozImageSmoothingEnabled = false;
      context.webkitImageSmoothingEnabled = false;
      context.msImageSmoothingEnabled = false;
      context.imageSmoothingEnabled = false;
      var img = Canvas2Image.convertToJPEG(canvas, canvas.width, canvas.height);
      $(img).css({
          "width": canvas.width / 2 + "px",
          "height": canvas.height / 2 + "px",
          "border": "0"
      });
      $("#finPic").empty().append(img);
      $(".fourth-page").show();

    });
}
  // 图片处理功能
  function PictureEdit(){
    this.imageWrap = $('#J_upload_box');
    this.cropBox = $('#J_file_box');
    this.preImg = $('#J_file_box_img');
    this.cropImg = null;
    this.cropper = new Cropper(document.getElementById("cropImg"), {
      aspectRatio: WHRatio,
      guides: false,
      cropBoxResizable: false,
      cropBoxMovable: false,
      dragCrop: false,
      dragMode:'move',
      autoCropArea:1,
      // minCropBoxWidth:400,
      // minCropBoxHeight:400,
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
			data: JSON.stringify({
        imgStr:pic
      }),
      dataType: "json",
			url: upPhotoUrl,
      contentType: "application/json",
			success: function(jsonData) {
        $("#number").html("No."+jsonData.number);
        $("#userPic").attr("src",initPhoto);
        console.log('^^^^^^^^^^^^:',jsonData);
        audioAutoPlay("success");
        $(".second-page").hide();
        $(".third-page").show();

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
        // var maxSize = 1024 * 1024 * 2;
        // if(file.size > maxSize) {
        //   alert("上传图片不能大于2M");
        //   return;
        // }
        // var reader = new FileReader();  
        // reader.onload = function(evt) {  
        //     that.selectImg = true;
        //     that.showCropBox();
        //     var replaceSrc = evt.target.result;  
        //     // 更换cropper的图片  
        //     that.cropper.replace(replaceSrc);
        //     that.cropper.setAspectRatio = WHRatio;
        //     that.preImg.attr("src",URL.createObjectURL(file));
        //     //$('#tailoringImg').cropper('replace', replaceSrc, false);// 默认false，适应高度，不失真  
        // }  
        // reader.readAsDataURL(file);  
        window
        .lrz(file,{
            quality: 0.4 //设置压缩率
          }).then(function (rst) {
            var img = new Image();
            img.src= rst.base64;
            img.onload = function () {
              initPhotoH = this.height;
              initPhotoW = this.width;
            }
            initPhoto = rst.base64;
            that.selectImg = true;
            that.showCropBox();
            // 更换cropper的图片  
            that.cropper.replace(rst.base64);
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
