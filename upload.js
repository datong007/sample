class ImageProcessor {
  constructor(options = {}) {
    this.maxWidth = options.maxWidth || 800; // 最大宽度
    this.maxHeight = options.maxHeight || 800; // 最大高度
    this.quality = options.quality || 0.8; // 压缩质量
    this.targetFormat = options.format || 'image/jpeg'; // 目标格式
  }

  // 处理图片
  async processImage(file) {
    // ... existing code ...
    
    // 创建图片对象
    const image = new Image();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        image.src = e.target.result;
        image.onload = () => {
          // 计算压缩后的尺寸
          const { width, height } = this.calculateDimensions(image);
          
          // 创建 canvas 进行压缩
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, width, height);
          
          // 转换格式并压缩
          canvas.toBlob((blob) => {
            resolve(blob);
          }, this.targetFormat, this.quality);
        };
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 计算压缩后的尺寸
  calculateDimensions(image) {
    let { width, height } = image;
    const aspectRatio = width / height;

    if (width > this.maxWidth) {
      width = this.maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > this.maxHeight) {
      height = this.maxHeight;
      width = height * aspectRatio;
    }

    return { width, height };
  }
}

// 使用示例
const uploadHandler = async (file) => {
  try {
    const processor = new ImageProcessor({
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      format: 'image/jpeg'
    });

    const processedBlob = await processor.processImage(file);
    
    // 创建 FormData 用于上传
    const formData = new FormData();
    formData.append('image', processedBlob, file.name);
    
    // 上传处理后的图片
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  } catch (error) {
    console.error('图片处理失败:', error);
    throw error;
  }
}; 