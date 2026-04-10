import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Sử dụng Worker trực tiếp từ thư viện đã cài đặt để tránh lỗi CDN
// Lưu ý: Trong Next.js, ta cần trỏ vào file worker.mjs trong node_modules
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const documentProcessor = {
  async extractText(file: File): Promise<string> {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'pdf') {
        return await this.extractFromPDF(file);
      } else if (extension === 'docx') {
        return await this.extractFromDocx(file);
      } else if (extension === 'txt' || extension === 'md') {
        return await file.text();
      } else {
        throw new Error('Định dạng file không hỗ trợ. Hãy dùng PDF, Docx hoặc Txt.');
      }
    } catch (error: any) {
      console.error("Lỗi trích xuất văn bản:", error);
      throw new Error(`Không thể đọc tài liệu: ${error.message}`);
    }
  },

  async extractFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    // Thêm log để bắt lỗi quá trình load worker
    console.log("📄 Đang khởi tạo PDF.js...");
    const loadingTask = pdfjs.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true, // Thêm tính năng này để hỗ trợ font tiếng Việt tốt hơn
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => 'str' in item ? item.str : '');
      fullText += strings.join(' ') + '\n';
    }
    
    return fullText;
  },

  async extractFromDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
};
