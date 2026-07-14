// Run: node create-w8-essay.js
// Requires: npm install docx  (run once in this folder)
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, PageNumber, Header, ExternalHyperlink,
  PageBreak, UnderlineType, WidthType, BorderStyle, ShadingType,
  VerticalAlign, HeadingLevel
} = require('docx');
const fs   = require('fs');
const path = require('path');

// ─── Constants ───────────────────────────────────────────────────────────────
const FONT = 'Times New Roman';
const PT12 = 24;   // 12pt in half-points
const PT10 = 20;   // 10pt for table
const INDENT = 720; // 0.5 inch
const DS = { before: 0, after: 0, line: 480, lineRule: 'auto' };
const SS = { before: 0, after: 0, line: 240, lineRule: 'auto' }; // single for table

// ─── Helpers ─────────────────────────────────────────────────────────────────
const blank  = () => new Paragraph({ spacing: DS, children: [new TextRun('')] });
const body   = (text, noIndent = false) => new Paragraph({
  spacing: DS,
  indent: noIndent ? undefined : { firstLine: INDENT },
  children: [new TextRun({ text, font: FONT, size: PT12 })],
});
const bold   = (text, noIndent = false) => new Paragraph({
  spacing: DS,
  indent: noIndent ? undefined : { firstLine: INDENT },
  children: [new TextRun({ text, font: FONT, size: PT12, bold: true })],
});
const h1     = (text) => new Paragraph({
  spacing: DS,
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text, font: FONT, size: PT12, bold: true })],
});
const center = (text, opts = {}) => new Paragraph({
  spacing: DS,
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text, font: FONT, size: PT12, ...opts })],
});
const ref    = (text) => new Paragraph({
  spacing: DS,
  indent: { left: INDENT, hanging: INDENT },
  children: [new TextRun({ text, font: FONT, size: PT12 })],
});
const linkCenter = (url) => new Paragraph({
  spacing: DS,
  alignment: AlignmentType.CENTER,
  children: [
    new ExternalHyperlink({
      link: url,
      children: [new TextRun({ text: url, font: FONT, size: PT12, style: 'Hyperlink' })],
    }),
  ],
});
const linkBody = (url) => new Paragraph({
  spacing: DS,
  indent: { left: INDENT, hanging: INDENT },
  children: [
    new ExternalHyperlink({
      link: url,
      children: [new TextRun({ text: url, font: FONT, size: PT12, style: 'Hyperlink' })],
    }),
  ],
});

// ─── Scoring Table ───────────────────────────────────────────────────────────
// Columns: Outcome | 5 Proficient | 4 Somewhat | 3 | 2 | 1 Not | Not Included | Cannot
// Widths (must sum to 9360 = content width at 1" margins, US Letter):
const COL_W = [3200, 850, 900, 600, 600, 600, 870, 740]; // total = 9360

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function headerCell(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: BORDERS,
    shading: { fill: 'D9D9D9', type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: SS,
      children: [new TextRun({ text, font: FONT, size: PT10, bold: true })],
    })],
  });
}

function dataCell(text, w, checked = false) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: BORDERS,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: SS,
      children: [new TextRun({
        text: checked ? '✔' : '',
        font: FONT,
        size: PT10,
        bold: true,
      })],
    })],
  });
}

function outcomeLabelCell(text, w) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: BORDERS,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      spacing: SS,
      children: [new TextRun({ text, font: FONT, size: PT10 })],
    })],
  });
}

function sectionLabelRow(label) {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: 8,
        width: { size: 9360, type: WidthType.DXA },
        borders: BORDERS,
        shading: { fill: 'BFBFBF', type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [new Paragraph({
          spacing: SS,
          children: [new TextRun({ text: label, font: FONT, size: PT10, bold: true })],
        })],
      }),
    ],
  });
}

// Scores: [5, 4, 3, 2, 1, notIncluded, cannotEval]
function outcomeRow(label, scores) {
  return new TableRow({
    children: [
      outcomeLabelCell(label, COL_W[0]),
      ...scores.map((checked, i) => dataCell('', COL_W[i + 1], checked)),
    ],
  });
}

const scoringTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: COL_W,
  rows: [
    // Header row
    new TableRow({
      children: [
        headerCell('Learning Outcome', COL_W[0]),
        headerCell('Proficient\n5', COL_W[1]),
        headerCell('Somewhat Proficient\n4', COL_W[2]),
        headerCell('3', COL_W[3]),
        headerCell('2', COL_W[4]),
        headerCell('Not Proficient\n1', COL_W[5]),
        headerCell('Not Included in Program', COL_W[6]),
        headerCell('Cannot Evaluate', COL_W[7]),
      ],
    }),

    // Cognitive section
    sectionLabelRow('Cognitive Learning Outcomes'),

    outcomeRow(
      'Analyze, integrate and apply theories, research, and techniques to plan and serve effectively in one\'s professional field of study',
      [false, true, false, false, false, false, false] // 4
    ),
    outcomeRow(
      'Acquire knowledge of laws, ethics, and values and apply this knowledge to make decisions appropriate to one\'s professional practice',
      [true, false, false, false, false, false, false] // 5
    ),
    outcomeRow(
      'Communicate effectively as professionals',
      [false, true, false, false, false, false, false] // 4
    ),

    // Affective section
    sectionLabelRow('Affective Learning Outcomes'),

    outcomeRow(
      'Demonstrate an understanding of the value of continued personal and professional development',
      [true, false, false, false, false, false, false] // 5
    ),
    outcomeRow(
      'Model Ottawa University values and culture by practicing mutual respect, encouragement, and support within and beyond the learning community',
      [false, true, false, false, false, false, false] // 4
    ),
  ],
});

// ─── Document ────────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: PT12 } } },
    paragraphStyles: [
      {
        id: 'Hyperlink', name: 'Hyperlink',
        run: { color: '0563C1', underline: { type: UnderlineType.SINGLE } },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: PT12 })],
        })],
      }),
    },

    children: [
      // ── Title Page ────────────────────────────────────────────────────────
      blank(), blank(), blank(),

      center('MBA Program Portfolio & Assessment Essay', { bold: true }),
      blank(),
      center('Kun Zhang'),
      center('Ottawa University'),
      center('MBA Capstone Portfolio'),
      center('June 27, 2026'),
      blank(),
      new Paragraph({
        spacing: DS,
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'Portfolio: ', font: FONT, size: PT12 }),
          new ExternalHyperlink({
            link: 'https://zhangkun.dev/emba/',
            children: [new TextRun({ text: 'https://zhangkun.dev/emba/', font: FONT, size: PT12, style: 'Hyperlink' })],
          }),
        ],
      }),

      // ── Page 2: Essay ─────────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),

      center('MBA Program Portfolio & Assessment Essay', { bold: true }),
      blank(),

      // Scoring table
      scoringTable,
      blank(),

      // Introduction
      body(
        'As an international student from China with a background in software engineering, I entered ' +
        'the Ottawa University MBA program with a focused goal: to develop the business judgment and ' +
        'leadership foundation needed to move from a purely technical role into a technology management ' +
        'position. Completing this program while working full-time has required discipline and ' +
        'intentionality, and reflecting on the learning outcomes below has helped me appreciate how ' +
        'much my thinking has changed over the course of the program. All assignments referenced ' +
        'below are accessible as embedded artifacts on my portfolio website at https://zhangkun.dev/emba/.'
      ),
      blank(),

      // ── CLO 1 ─────────────────────────────────────────────────────────────
      h1('Cognitive Learning Outcome 1: Analyze, Integrate, and Apply Theories (Score: 4 — Somewhat Proficient)'),
      blank(),

      body(
        'Throughout the program, I was repeatedly asked to move beyond description and apply ' +
        'theoretical frameworks to real business situations. In BUS 8500 (Business Policies and ' +
        'Strategies), my group conducted an external situation analysis of McDonald\'s Corporation ' +
        'using both the STEEP framework and Porter\'s Five Forces model (Ejeta et al., 2026). This ' +
        'required integrating macroeconomic data, competitive intelligence, and strategic theory into ' +
        'a coherent executive argument — a type of analytical synthesis I had not previously practiced. ' +
        'In IT 8000 (Data Analytics), I applied Excel-based statistical functions including SUMIFS, ' +
        'AVERAGEIFS, and COUNTIFS to Cisco Systems\' quarterly revenue data, then translated those ' +
        'findings into management-facing visualizations (Zhang, 2025a). In BUS 7800 (Managerial ' +
        'Accounting), my group applied the Balanced Scorecard framework to propose performance metrics ' +
        'across four strategic perspectives for a retail case study (Osiri et al., 2025).'
      ),
      body(
        'I rate this outcome a 4 rather than 5 because I recognize that my analytical depth still ' +
        'grows with exposure. In several courses, I was strong at applying given frameworks but less ' +
        'confident generating novel frameworks from scratch. This is an area I intend to continue ' +
        'developing in my professional work.'
      ),
      blank(),

      // ── CLO 2 ─────────────────────────────────────────────────────────────
      h1('Cognitive Learning Outcome 2: Laws, Ethics, and Values (Score: 5 — Proficient)'),
      blank(),

      body(
        'BUS 7200 (Value Systems and Ethics) had the most lasting impact on my approach to ' +
        'professional decision-making. Analyzing the Volkswagen emissions scandal through multiple ' +
        'ethical lenses — including consequentialism, deontology, and stakeholder theory — helped me ' +
        'develop a more structured and honest way of evaluating choices that carry moral weight ' +
        '(Moorthamers et al., 2024). Coming from a cultural context where business ethics ' +
        'frameworks are discussed differently, this course gave me vocabulary and analytical tools ' +
        'that I apply regularly in my work.'
      ),
      body(
        'In BUS 7700 (Management Information Systems), my group analyzed Uber\'s data privacy ' +
        'architecture through the lens of GDPR, PCI DSS, and informed consent models, weighing ' +
        'opt-in versus opt-out approaches to user data collection (Group 1, 2026). In IT 8003 ' +
        '(Cloud Computing), I evaluated cloud storage solutions for a financial services firm ' +
        'against compliance standards such as SOC 2 and PCI DSS, recognizing that technology ' +
        'choices carry legal and ethical obligations (Zhang, 2025b). I assign a score of 5 for ' +
        'this outcome because across multiple courses I was asked to integrate legal and ethical ' +
        'reasoning into concrete business recommendations, not merely describe them.'
      ),
      blank(),

      // ── CLO 3 ─────────────────────────────────────────────────────────────
      h1('Cognitive Learning Outcome 3: Communicate Effectively as Professionals (Score: 4 — Somewhat Proficient)'),
      blank(),

      body(
        'Before this program, nearly all of my professional writing was technical documentation ' +
        'for engineering audiences. The MBA curriculum required a fundamentally different register: ' +
        'writing for executives, clients, and non-technical stakeholders. The McDonald\'s external ' +
        'situation analysis demanded concise strategic prose supported by research citations (Ejeta ' +
        'et al., 2026). The Balanced Scorecard report required translating quantitative performance ' +
        'targets into narrative justification accessible to retail management (Osiri et al., 2025). ' +
        'The BUS 7200 ethics case study required constructing a persuasive argument with well-cited ' +
        'evidence and a clear ethical position (Moorthamers et al., 2024).'
      ),
      body(
        'As an English-as-second-language student, I have worked hard to develop professional ' +
        'written communication skills in an academic context, and I am proud of the progress I have ' +
        'made. I rate this outcome a 4 because oral communication received less structured ' +
        'development than written work within the coursework, and I continue to practice presenting ' +
        'complex ideas clearly and concisely in spoken contexts.'
      ),
      blank(),

      // ── ALO 1 ─────────────────────────────────────────────────────────────
      h1('Affective Learning Outcome 1: Continued Personal and Professional Development (Score: 5 — Proficient)'),
      blank(),

      body(
        'The decision to pursue an EMBA while working full-time as a software engineer is itself ' +
        'the most direct evidence I can offer for this outcome. Every week required me to balance ' +
        'professional responsibilities, coursework, and group project coordination across time zones. ' +
        'The BUS 7000 (Organizational Behavior) journal assignments were particularly valuable for ' +
        'prompting structured self-reflection on topics such as power, conflict, impression ' +
        'management, and organizational justice (Zhang, 2026). Writing about my own experiences ' +
        'with influence and resistance — and connecting them to course theory — helped me understand ' +
        'patterns in my own professional behavior that I had not previously examined.'
      ),
      body(
        'The IT 8100 (Database Architecture) project also reflects professional development: I took ' +
        'a domain I already understood technically and pushed myself to document and justify design ' +
        'decisions in business and academic terms rather than purely engineering terms (Group, 2024). ' +
        'I assign this outcome a 5 because the program has reinforced in me a genuine commitment to ' +
        'lifelong learning, and I leave it with a clearer development plan than I had when I started.'
      ),
      blank(),

      // ── ALO 2 ─────────────────────────────────────────────────────────────
      h1('Affective Learning Outcome 2: Ottawa University Values — Mutual Respect and Support (Score: 4 — Somewhat Proficient)'),
      blank(),

      body(
        'Several of my courses required sustained group collaboration, which gave me concrete ' +
        'opportunities to practice the values of mutual respect, encouragement, and accountability. ' +
        'In BUS 7800, my group of three students with very different professional backgrounds worked ' +
        'together to produce the Balanced Scorecard analysis, requiring each of us to contribute ' +
        'our strengths while supporting areas where others had more expertise (Osiri et al., 2025). ' +
        'In BUS 8500, a four-person group divided the STEEP and Porter\'s Five Forces analysis ' +
        'across sections and then synthesized them into a single coherent argument (Ejeta et al., 2026).'
      ),
      body(
        'As an international student, I am also aware of the responsibility to contribute a ' +
        'different perspective to classroom and group discussions, not just to receive knowledge ' +
        'but to broaden the learning community through my own cultural and professional background. ' +
        'I rate this outcome a 4 because much of the program\'s collaboration occurred online and ' +
        'asynchronously, which limited the depth of community that I believe is possible in ' +
        'face-to-face settings. I would have valued more opportunities for in-person engagement.'
      ),
      blank(),

      // ── Conclusion ────────────────────────────────────────────────────────
      h1('Conclusion'),
      blank(),
      body(
        'Across these five learning outcomes, I assess myself as Proficient in two and Somewhat ' +
        'Proficient in three, which reflects both genuine growth and honest recognition of where ' +
        'further development is needed. The MBA program has equipped me with frameworks, language, ' +
        'and a professional network that I did not have before. Most importantly, it has shifted ' +
        'how I think about my role at work: from a technologist who solves defined problems to a ' +
        'professional who helps define which problems are worth solving. All representative ' +
        'assignments from my core and IT concentration courses are available at ' +
        'https://zhangkun.dev/emba/ for review.'
      ),
      blank(),

      // ── References Page ───────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),

      h1('References'),
      blank(),

      ref(
        'Ejeta, A. O., Beh, C. H., Zhang, K., & Menon, N. A. (2026). External situation analysis ' +
        'of McDonald\'s Corporation [Unpublished group assignment]. Ottawa University.'
      ),
      ref(
        'Group (Osiri, A., Lakhpatia, D., & Zhang, K.). (2025). Balanced Scorecard analysis for ' +
        'Ragland Department Store [Unpublished group assignment]. Ottawa University.'
      ),
      ref(
        'Group (Rahul, Baimukhanova, D., Beh, C. H., Liu, X., & Zhang, K.). (2026). MIS management ' +
        'analysis project proposal (Part 2) [Unpublished group assignment]. Ottawa University.'
      ),
      ref(
        'Group (various). (2024). Pharmaceutical management system — database design ' +
        '[Unpublished group assignment]. Ottawa University.'
      ),
      ref(
        'Moorthamers, B., Zhang, K., & Feitosa De Melo, M. (2024). VW emissions scandal case ' +
        'study [Unpublished group assignment]. Ottawa University.'
      ),
      ref(
        'Zhang, K. (2025a). Cisco Systems dataset report [Unpublished assignment]. Ottawa University.'
      ),
      ref(
        'Zhang, K. (2025b). Analyzing cloud storage disk type and capabilities ' +
        '[Unpublished assignment]. Ottawa University.'
      ),
      ref(
        'Zhang, K. (2026). Session D journal — Power & conflict in organizations ' +
        '[Unpublished assignment]. Ottawa University.'
      ),
      blank(),
      ref('Portfolio: https://zhangkun.dev/emba/'),
    ],
  }],
});

// ─── Save ─────────────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, 'w8 portfolio assessment.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('✅ Saved to:', outPath);
}).catch(err => {
  console.error('❌ Error:', err.message);
});
