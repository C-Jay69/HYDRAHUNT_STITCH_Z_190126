
const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
});

export const extractTextFromFile = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();

    return new Promise((resolve, reject) => {
        // PDF Handling
        if (fileName.endsWith('.pdf')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    // @ts-ignore
                    let pdfjsLib = window.pdfjsLib;
                    if (!pdfjsLib) {
                        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
                        // @ts-ignore
                        pdfjsLib = window.pdfjsLib;
                        // @ts-ignore
                        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
                          // @ts-ignore
                          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                        }
                    }

                    const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        // @ts-ignore
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    resolve(fullText);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        } 
        // DOCX Handling
        else if (fileName.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    // @ts-ignore
                    let mammoth = window.mammoth;
                    if (!mammoth) {
                        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
                        // @ts-ignore
                        mammoth = window.mammoth;
                    }

                    const result = await mammoth.extractRawText({ arrayBuffer: event.target?.result });
                    resolve(result.value);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        } 
        // Plain Text / JSON / Markdown Handling
        else {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        }
    });
};
