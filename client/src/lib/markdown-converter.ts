import { marked } from "marked";

// Configure marked for email-safe HTML
marked.setOptions({
  breaks: true,
  gfm: true,
});

export interface ConversionResult {
  html: string;
  characterCount: number;
  wordCount: number;
  estimatedSize: number;
}

export function convertMarkdownToHTML(markdown: string): ConversionResult {
  const html = marked(markdown) as string;
  const characterCount = markdown.length;
  const wordCount = markdown.trim().split(/\s+/).filter(word => word.length > 0).length;
  const estimatedSize = new Blob([html]).size;

  return {
    html,
    characterCount,
    wordCount,
    estimatedSize
  };
}

export function generateEmailHTML(content: string, template: string = 'default'): string {
  const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Newsletter</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            text-decoration: none;
        }

        /* Email client fixes */
        .ReadMsgBody { width: 100%; }
        .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
            line-height: 100%;
        }

        /* Main styles */
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            min-width: 100%;
            background-color: #f8fafc;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            padding: 32px 32px 24px;
            border-bottom: 1px solid #e2e8f0;
        }

        .content {
            padding: 32px;
        }

        .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 8px;
            line-height: 1.2;
        }

        h2 {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin: 24px 0 12px;
            line-height: 1.3;
        }

        h3 {
            font-size: 18px;
            font-weight: 500;
            color: #1e293b;
            margin: 20px 0 8px;
            line-height: 1.4;
        }

        p {
            font-size: 16px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 16px;
        }

        ul, ol {
            margin: 0 0 16px;
            padding-left: 20px;
        }

        li {
            font-size: 16px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 8px;
        }

        a {
            color: #2563eb;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 16px 0;
        }

        .button:hover {
            background-color: #1d4ed8;
            text-decoration: none;
        }

        blockquote {
            border-left: 4px solid #2563eb;
            padding-left: 16px;
            margin: 16px 0;
            font-style: italic;
            color: #475569;
        }

        code {
            background-color: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;
        }

        pre {
            background-color: #f1f5f9;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 16px 0;
        }

        hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 32px 0;
        }

        /* Responsive styles */
        @media screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                margin: 0 !important;
                border-radius: 0 !important;
            }
            
            .header, .content, .footer {
                padding-left: 16px !important;
                padding-right: 16px !important;
            }

            h1 {
                font-size: 24px !important;
            }

            h2 {
                font-size: 18px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            ${content}
        </div>
    </div>
</body>
</html>`;

  return emailHTML;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}
