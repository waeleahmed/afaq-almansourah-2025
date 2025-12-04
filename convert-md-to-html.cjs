const fs = require('fs');
const { marked } = require('marked');

// HTML Template
const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        
        * {
            font-family: 'Cairo', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
            margin: 0;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        h1 {
            color: #667eea;
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 4px solid #667eea;
        }
        
        h2 {
            color: #764ba2;
            font-size: 2rem;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        
        h3 {
            color: #555;
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1.5rem;
        }
        
        h4 {
            color: #666;
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        p {
            line-height: 1.8;
            color: #333;
            margin-bottom: 1rem;
        }
        
        ul, ol {
            line-height: 2;
            color: #333;
            margin-bottom: 1rem;
        }
        
        li {
            margin-bottom: 0.5rem;
        }
        
        strong {
            color: #667eea;
            font-weight: 700;
        }
        
        code {
            background: #f5f5f5;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
        }
        
        pre {
            background: #2d3748;
            color: #f7fafc;
            padding: 1.5rem;
            border-radius: 10px;
            overflow-x: auto;
            margin: 1rem 0;
        }
        
        pre code {
            background: transparent;
            color: inherit;
            padding: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            text-align: right;
            font-weight: 700;
        }
        
        td {
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        tr:hover {
            background: #f7fafc;
        }
        
        blockquote {
            border-right: 4px solid #667eea;
            padding-right: 1.5rem;
            margin: 1.5rem 0;
            color: #555;
            font-style: italic;
            background: #f7fafc;
            padding: 1rem 1.5rem;
            border-radius: 8px;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e2e8f0;
            margin: 2rem 0;
        }
        
        a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        .back-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 700;
            margin-bottom: 2rem;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .back-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            text-decoration: none;
        }
        
        .print-button {
            position: fixed;
            bottom: 2rem;
            left: 2rem;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            border: none;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            transition: all 0.3s;
            z-index: 1000;
        }
        
        .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                padding: 1rem;
            }
            
            .back-button,
            .print-button {
                display: none;
            }
        }
        
        @media (max-width: 768px) {
            body {
                padding: 1rem;
            }
            
            .container {
                padding: 1.5rem;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
            
            table {
                font-size: 0.875rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="/public/index.html" class="back-button">← العودة للصفحة الرئيسية</a>
        ${content}
    </div>
    <button class="print-button" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
</body>
</html>`;

// Files to convert
const files = [
    {
        input: 'CONTRACT_TEMPLATE.md',
        output: 'public/contract.html',
        title: 'عقد ترخيص استخدام نظام تقييم المعلمين الإلكتروني'
    },
    {
        input: 'EMAIL_TEMPLATES.md',
        output: 'public/email-templates.html',
        title: 'قوالب رسائل البريد الإلكتروني التسويقية'
    },
    {
        input: 'DISTRIBUTION_GUIDE.md',
        output: 'public/distribution-guide.html',
        title: 'دليل توزيع البرنامج للمدارس الأخرى'
    }
];

// Convert each file
files.forEach(file => {
    try {
        console.log(`Converting ${file.input}...`);
        const markdown = fs.readFileSync(file.input, 'utf8');
        const htmlContent = marked.parse(markdown);
        const fullHtml = htmlTemplate(file.title, htmlContent);
        fs.writeFileSync(file.output, fullHtml);
        console.log(`✅ Created ${file.output}`);
    } catch (error) {
        console.error(`❌ Error converting ${file.input}:`, error.message);
    }
});

console.log('\n✅ All files converted successfully!');
