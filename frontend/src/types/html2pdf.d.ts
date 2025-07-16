declare module 'html2pdf.js' {
  export default function html2pdf(): html2pdfInstance;
  
  interface html2pdfInstance {
    from(element: HTMLElement): html2pdfInstance;
    set(options: html2pdfOptions): html2pdfInstance;
    save(): Promise<void>;
    output(type: string, options: any): Promise<string>;
    then(callback: Function): html2pdfInstance;
    catch(callback: Function): html2pdfInstance;
  }
  
  interface html2pdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      logging?: boolean;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: 'portrait' | 'landscape';
      [key: string]: any;
    };
    [key: string]: any;
  }
}
