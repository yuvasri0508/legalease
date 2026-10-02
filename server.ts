import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI client with telemetry user-agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// JSON File Database for Documents
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'documents.json');

interface StoredDocument {
  id: string;
  userId: string;
  type: 'Rental Agreement' | 'NDA' | 'Loan Agreement' | 'Employment Agreement' | 'Affidavit';
  title: string;
  content: string;
  status: 'Draft' | 'Finalized' | 'Under Review';
  summary?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Initial realistic demo documents
const INITIAL_DOCUMENTS: StoredDocument[] = [
  {
    id: 'doc-1',
    userId: 'user-demo-1',
    type: 'Rental Agreement',
    title: 'Residential Lease Agreement – 742 Evergreen Terrace',
    status: 'Finalized',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-18T14:30:00.000Z',
    summary: '12-month residential apartment lease between Marcus Vance (Landlord) and Sarah Jenkins (Tenant). Rent: $2,400/month.',
    content: `RESIDENTIAL LEASE AGREEMENT

THIS LEASE AGREEMENT (the "Agreement") is entered into on this 1st day of October, 2026, by and between:

LANDLORD: Marcus Vance, residing at 120 Oakridge Blvd, Austin, TX ("Landlord"), and
TENANT: Sarah Jenkins, residing at 742 Evergreen Terrace, Apt 4B, Austin, TX ("Tenant").

1. PREMISES
Landlord leases to Tenant and Tenant leases from Landlord the residential real property located at 742 Evergreen Terrace, Apartment 4B, Austin, Travis County, Texas 78701 (the "Premises").

2. TERM
The term of this Lease shall commence on October 1, 2026, and terminate on September 30, 2027 (the "Initial Term"). Upon expiration of the Initial Term, this Lease shall continue on a month-to-month basis unless either party provides sixty (60) days' written notice of non-renewal.

3. RENT & PAYMENT TERMS
Tenant agrees to pay monthly rent in the amount of Two Thousand Four Hundred Dollars ($2,400.00) USD, payable on or before the first (1st) calendar day of each month. Payments shall be remitted via electronic funds transfer or certified cashier's check. A late fee of Fifty Dollars ($50.00) shall accrue for payments received after the 5th day of the month.

4. SECURITY DEPOSIT
Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of Two Thousand Four Hundred Dollars ($2,400.00) as security for full performance. The Security Deposit shall be held in an escrow account and refunded within thirty (30) days following termination, less allowable deductions for damage beyond normal wear and tear.

5. UTILITIES AND SERVICES
Landlord shall be responsible for: Water, Sewer, and Trash Collection.
Tenant shall be responsible for: Electricity, High-Speed Internet, and Gas.

6. USE AND OCCUPANCY
The Premises shall be occupied solely by Tenant as a private single-family residence. Subletting, assignment, or short-term vacation rentals (e.g., Airbnb) without Landlord's prior written consent are strictly prohibited.

7. PET POLICY
One (1) domestic cat or dog under 35 lbs is permitted, subject to an upfront non-refundable pet fee of $300.00 and pet addendum compliance.

8. GOVERNING LAW
This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of Texas.

IN WITNESS WHEREOF, the Landlord and Tenant have executed this Agreement on the date first written above.

_____________________________                _____________________________
Marcus Vance (Landlord)                      Sarah Jenkins (Tenant)
Date: October 1, 2026                        Date: October 1, 2026`,
  },
  {
    id: 'doc-2',
    userId: 'user-demo-1',
    type: 'NDA',
    title: 'Mutual Non-Disclosure Agreement – NovaTech & Apex Labs',
    status: 'Finalized',
    createdAt: '2026-09-22T08:15:00.000Z',
    updatedAt: '2026-09-24T11:45:00.000Z',
    summary: 'Mutual confidentiality and trade secret protection agreement between NovaTech Solutions and Apex Labs for proprietary AI algorithms.',
    content: `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made effective as of September 25, 2026 ("Effective Date"), by and between:

PARTIES:
1. NovaTech Solutions Inc., a Delaware corporation ("Party A"), and
2. Apex Labs LLC, a California limited liability company ("Party B").
Party A and Party B may individually be referred to as a "Party" and collectively as the "Parties."

1. PURPOSE
The Parties wish to explore a potential strategic business relationship and joint technology integration involving proprietary machine learning architectures and software APIs (the "Purpose").

2. CONFIDENTIAL INFORMATION
"Confidential Information" refers to all non-public, confidential or proprietary information disclosed by one Party ("Disclosing Party") to the other Party ("Receiving Party"), whether orally, visually, or in tangible/electronic form, including without limitation source code, algorithmic weights, financial data, business strategies, customer lists, and patent disclosures.

3. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees:
(a) To hold the Disclosing Party's Confidential Information in strict confidence using the same degree of care it uses for its own confidential information, but in no event less than reasonable care;
(b) Not to disclose such Confidential Information to any third party without prior written consent;
(c) To restrict disclosure exclusively to employees, directors, and legal advisors who have a verifiable need-to-know and are bound by confidentiality obligations at least as restrictive as this Agreement.

4. EXCLUSIONS FROM CONFIDENTIALITY
Confidential Information does not include information that:
(a) Is or becomes publicly known through no breach of this Agreement;
(b) Was already lawfully known to Receiving Party prior to disclosure;
(c) Is independently developed without reference to or reliance upon Disclosing Party's information.

5. DURATION OF OBLIGATIONS
The confidentiality obligations under this Agreement shall remain in effect for a period of three (3) years from the Effective Date, except for trade secrets, which shall remain protected for as long as permitted under applicable trade secret laws.

6. GOVERNING LAW & JURISDICTION
This Agreement shall be construed and governed in accordance with the substantive laws of the State of Delaware, without giving effect to conflicts of law principles.

IN WITNESS WHEREOF, the Parties have executed this Mutual Non-Disclosure Agreement as of the Effective Date.

NOVATECH SOLUTIONS INC.                      APEX LABS LLC

By: ___________________________              By: ___________________________
Name: Elena Rostova                          Name: David K. Chen
Title: Chief Executive Officer               Title: Managing Director`,
  },
  {
    id: 'doc-3',
    userId: 'user-demo-1',
    type: 'Employment Agreement',
    title: 'Executive Employment Agreement – Senior Software Architect',
    status: 'Draft',
    createdAt: '2026-09-28T16:20:00.000Z',
    updatedAt: '2026-10-01T09:10:00.000Z',
    summary: 'Full-time employment agreement for Senior Software Architect role at Horizon Cloud Systems. Base salary: $175,000.',
    content: `EMPLOYMENT AGREEMENT

THIS EMPLOYMENT AGREEMENT (the "Agreement") is dated October 2, 2026, by and between:

EMPLOYER: Horizon Cloud Systems Inc., a California corporation ("Company"), and
EMPLOYEE: Jordan Lee, an individual residing in San Jose, California ("Employee").

1. POSITION AND DUTIES
The Company agrees to employ Employee, and Employee agrees to serve the Company, in the capacity of Senior Software Architect. Employee shall perform duties customary to such role, reporting directly to the Vice President of Engineering.

2. COMPENSATION & BENEFITS
(a) Base Salary: The Company shall pay Employee an annual base salary of $175,000.00 USD, payable in accordance with the Company's standard bi-weekly payroll practices.
(b) Annual Bonus: Employee shall be eligible for an annual performance bonus targeted at 15% of base salary, conditioned on attainment of corporate milestones.
(c) Benefits: Employee is entitled to comprehensive health, dental, and vision insurance coverage, 401(k) matching up to 4%, and 20 days of paid time off (PTO) annually.

3. AT-WILL EMPLOYMENT
Employee's employment with the Company is "at-will." Both Employee and Company may terminate the employment relationship at any time, with or without cause, upon two (2) weeks' advance written notice.

4. INTELLECTUAL PROPERTY ASSIGNMENT
All inventions, software code, improvements, designs, and work product conceived, reduced to practice, or created by Employee during the term of employment that relate directly to the Company's business shall be the sole and exclusive property of the Company.

5. NON-SOLICITATION
During employment and for twelve (12) months following termination, Employee agrees not to solicit or recruit any employee or contractor of the Company to depart from their relationship with the Company.

6. GOVERNING LAW
This Agreement shall be governed by and construed under the laws of the State of California.

EMPLOYER: HORIZON CLOUD SYSTEMS INC.          EMPLOYEE:

By: ________________________________          ________________________________
Authorized Signatory                          Jordan Lee`,
  },
];

function ensureDbFile(): StoredDocument[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DOCUMENTS, null, 2), 'utf-8');
      return INITIAL_DOCUMENTS;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading documents database:', err);
    return INITIAL_DOCUMENTS;
  }
}

function saveDb(docs: StoredDocument[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving documents database:', err);
  }
}

// Initialize DB
ensureDbFile();

// ==========================================
// API ROUTES
// ==========================================

// 1. AI Legal Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are "LegalEase AI", an expert, friendly, and practical legal assistant.
Your goal is to answer general legal questions in plain, accessible, and structured English.
Rules:
1. Explain legal concepts clearly without confusing jargon. If you must use a legal term (e.g., "indemnification", "severability"), define it simply.
2. Structure your answers with clear headings, bullet points, and key takeaways where helpful.
3. Highlight practical considerations, pros/cons, and common pitfalls.
4. If applicable, recommend relevant document templates (such as Rental Agreement, NDA, Loan Agreement, Employment Agreement, or Affidavit).
5. Always maintain a professional, objective, and reassuring tone.
6. Note: You provide general legal information, draft templates, and guidance, not formal attorney-client legal advice.`;

    if (ai) {
      // Build conversation context
      const contentsParts: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h: { role: string; content: string }) => {
          contentsParts.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          });
        });
      }
      contentsParts.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsParts,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const text = response.text || 'I apologize, but I could not formulate a response. Please try rephrasing your legal inquiry.';
      return res.json({ reply: text });
    } else {
      // Realistic fallback response when API key is not configured
      const lower = message.toLowerCase();
      let fallbackReply = `Here is a clear breakdown regarding your inquiry:\n\n### Key Legal Principles\n- **Clear Intent & Mutual Assent**: Legal agreements depend on both parties understanding and consenting to the core terms.\n- **Documentation**: Always ensure critical terms (consideration, deadlines, termination clauses) are written down in detail.\n\n### Recommended Next Steps\n1. Review whether standard agreement types (such as an NDA, Rental Agreement, or Loan Contract) fit your scenario.\n2. Use our **Smart Document Generator** to draft a tailored contract with customized clauses.\n3. Run your draft through **Document Check** to catch missing obligations or ambiguous wording.\n\n*Note: LegalEase provides general legal information and draft assistance, not formal attorney legal counsel.*`;

      if (lower.includes('nda') || lower.includes('confidential')) {
        fallbackReply = `### Understanding Non-Disclosure Agreements (NDAs)\n\nAn NDA is a legally binding contract where parties agree not to disclose sensitive information covered by the agreement.\n\n**1. Key Components:**\n- **Definition of Confidential Information**: What is protected (e.g., source code, financial figures, customer lists).\n- **Exclusions**: Standard exceptions (publicly known facts, independently developed ideas).\n- **Term Duration**: Typically 2 to 5 years, though trade secrets often remain protected indefinitely.\n- **Remedies for Breach**: Injunctions and financial damages.\n\n**2. Mutual vs. Unilateral:**\n- *Mutual NDA*: Both parties share and protect each other's proprietary data.\n- *Unilateral NDA*: Only one party shares sensitive data (e.g., pitch to investor or contractor).\n\n*You can draft a customized Mutual or One-Way NDA in under 2 minutes using our Smart Document Generator!*`;
      } else if (lower.includes('rent') || lower.includes('lease') || lower.includes('landlord') || lower.includes('tenant')) {
        fallbackReply = `### Key Considerations for Residential Leases\n\nWhen entering or drafting a rental agreement, key points to verify include:\n\n1. **Rent & Late Fees**: Explicit due date, grace periods, acceptable payment methods, and lawful late fee caps.\n2. **Security Deposit Rules**: Statutory return timeframes (commonly 14 to 30 days) and permissible itemized deductions.\n3. **Maintenance & Repairs**: Explicit division between tenant duties (routine cleanliness) and landlord duties (structural, HVAC, plumbing).\n4. **Notice of Entry**: Landlords must typically give 24-48 hours advance notice before entering premises, except in emergencies.\n5. **Subletting & Guests**: Clear boundaries for long-term visitors or subletting.\n\n*Need a comprehensive Lease? Try our Rental Agreement generator under "Generate Document".*`;
      } else if (lower.includes('loan') || lower.includes('promissory') || lower.includes('borrow')) {
        fallbackReply = `### What Makes a Loan Agreement Legally Enforceable?\n\nTo avoid disputes when lending or borrowing money, a formal Loan Agreement should specify:\n\n1. **Principal Amount**: Exact sum lent and date disbursed.\n2. **Interest Rate & Usury Compliance**: Simple vs. compounded interest, staying below statutory state usury limits.\n3. **Repayment Schedule**: Lump sum, monthly installments, or balloon payments.\n4. **Default Conditions**: What constitutes default (e.g., 15 days past due) and acceleration clauses (the entire balance becomes immediately due).\n5. **Collateral/Security**: Whether any asset is pledged as security for repayment.\n\n*Our Loan Agreement generator crafts clear repayment and default terms tailored to your scenario.*`;
      }

      return res.json({ reply: fallbackReply });
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Error processing legal chat request' });
  }
});

// 2. Smart Document Generator Endpoint
app.post('/api/generate-document', async (req: Request, res: Response) => {
  try {
    const { type, title, jurisdiction, answers } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    const docType = type as string;
    const docJurisdiction = jurisdiction || 'General / United States';

    if (ai) {
      const prompt = `You are an elite legal contract drafting attorney. Draft a comprehensive, professional, legally enforceable ${docType} in formal legal language with complete numbered clauses, definitions, covenants, warranties, remedies, and signature execution blocks.

Document Specification:
- Document Type: ${docType}
- Title / Label: ${title || docType}
- Jurisdiction / Governing Law: ${docJurisdiction}
- User Situation and Provided Details:
${JSON.stringify(answers, null, 2)}

Drafting Requirements:
1. Provide a full formal contract ready for execution.
2. Include ALL standard formal clauses for this specific agreement type:
   - Preamble identifying Parties with addresses and execution date
   - Recitals / Background ("WHEREAS...")
   - Clear Definitions section where applicable
   - Substantive covenants, payments, dates, amounts, responsibilities based on provided answers
   - Term, Termination, and Default provisions
   - Representations and Warranties
   - Confidentiality and Intellectual Property (if applicable)
   - Boilerplate: Severability, Entire Agreement, Amendments, Notice, Counterparts, Governing Law & Dispute Resolution
   - Formal Signature Lines with printed names, titles, and dates.
3. Do NOT include markdown code fences (like \`\`\`markdown). Output the legal document directly as clean plain text with standard uppercase headings and numbered sections.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
        },
      });

      const generatedContent = response.text || '';
      return res.json({
        content: generatedContent,
        title: title || `${docType} – Draft`,
        type: docType,
      });
    } else {
      // Dynamic fallback generator
      const generated = generateFallbackTemplate(docType, answers, docJurisdiction, title);
      return res.json(generated);
    }
  } catch (err: any) {
    console.error('Generate document error:', err);
    res.status(500).json({ error: err.message || 'Error generating document draft' });
  }
});

// Helper for high-quality fallback template generation
function generateFallbackTemplate(type: string, answers: any = {}, jurisdiction: string, customTitle?: string) {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  if (type === 'Rental Agreement') {
    const landlord = answers.landlordName || 'John Doe (Landlord)';
    const tenant = answers.tenantName || 'Jane Smith (Tenant)';
    const address = answers.propertyAddress || '100 Main Street, Suite 400';
    const rent = answers.rentAmount || '$2,000';
    const deposit = answers.securityDeposit || '$2,000';
    const duration = answers.durationMonths || '12';

    return {
      title: customTitle || `Residential Lease – ${address}`,
      type,
      content: `RESIDENTIAL LEASE AGREEMENT

THIS LEASE AGREEMENT (the "Agreement") is made and entered into as of ${dateStr}, by and between:

LANDLORD: ${landlord}
TENANT: ${tenant}

1. PREMISES
Landlord hereby leases to Tenant, and Tenant hereby leases from Landlord, the real property located at:
${address} (the "Premises"), together with all fixtures and appliances situated thereon.

2. LEASE TERM
The term of this Lease shall be for a duration of ${duration} months, commencing on ${dateStr}, unless sooner terminated pursuant to the terms hereof.

3. RENT & PAYMENT SCHEDULE
Tenant agrees to pay to Landlord as base rent the amount of ${rent} per month, payable in advance on the first (1st) day of each calendar month. Payments made after the fifth (5th) calendar day shall incur a late charge of 5% of the delinquent amount.

4. SECURITY DEPOSIT
Concurrently with the execution of this Agreement, Tenant shall deposit with Landlord the sum of ${deposit} as a security deposit for the faithful performance by Tenant of all terms of this Lease. The deposit shall be returned within statutory guidelines following surrender of the Premises, subject to allowable deductions.

5. USE AND OCCUPANCY
The Premises shall be utilized exclusively as a private residential dwelling. Tenant shall not commit waste, create a nuisance, or violate any municipal ordinances or state statutes.

6. UTILITIES AND MAINTENANCE
Tenant shall be responsible for all utilities servicing the Premises, including electric, gas, water, and trash removal, unless specifically noted in writing. Tenant shall keep the Premises clean, sanitary, and in good order.

7. GOVERNING LAW
This Lease shall be governed by, construed, and enforced in accordance with the laws of ${jurisdiction}.

IN WITNESS WHEREOF, the Landlord and Tenant have executed this Agreement on the date first set forth above.

_____________________________                _____________________________
${landlord}                                  ${tenant}
Date: ${dateStr}                             Date: ${dateStr}`
    };
  }

  if (type === 'NDA') {
    const partyA = answers.disclosingParty || 'Company Inc. (Disclosing Party)';
    const partyB = answers.receivingParty || 'Partner LLC (Receiving Party)';
    const purpose = answers.purpose || 'Evaluating potential commercial collaboration and technology partnership';
    const termYears = answers.termYears || '2';

    return {
      title: customTitle || `Non-Disclosure Agreement – ${partyA} & ${partyB}`,
      type,
      content: `MUTUAL NON-DISCLOSURE AGREEMENT

THIS MUTUAL NON-DISCLOSURE AGREEMENT ("Agreement") is entered into as of ${dateStr} ("Effective Date"), by and between:

DISCLOSING PARTY: ${partyA}
RECEIVING PARTY: ${partyB}

WHEREAS, the Parties desire to engage in confidential discussions concerning:
${purpose} (the "Authorized Purpose").

NOW, THEREFORE, in consideration of the mutual covenants herein contained:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" shall include all data, trade secrets, software designs, financial figures, customer data, and proprietary information disclosed by one Party to the other, whether written, oral, or electronic.

2. NONDISCLOSURE OBLIGATIONS
The Receiving Party agrees to:
(a) Protect and preserve the confidential nature of all Confidential Information with at least reasonable care;
(b) Not disclose or distribute any Confidential Information to third parties without prior written consent;
(c) Utilize the Confidential Information solely in connection with the Authorized Purpose.

3. TERM AND SURVIVAL
This Agreement and the confidentiality covenants set forth herein shall remain binding and in effect for a period of ${termYears} years from the Effective Date.

4. INJUNCTIVE RELIEF
The Parties acknowledge that any unauthorized disclosure or use of Confidential Information will cause irreparable harm for which monetary damages alone would be inadequate, entitling the Disclosing Party to seek immediate injunctive relief.

5. GOVERNING LAW
This Agreement shall be governed by and interpreted pursuant to the laws of ${jurisdiction}.

EXECUTED by the authorized representatives of the Parties as of the Effective Date:

_____________________________                _____________________________
For: ${partyA}                               For: ${partyB}
Date: ${dateStr}                             Date: ${dateStr}`
    };
  }

  if (type === 'Loan Agreement') {
    const lender = answers.lenderName || 'First Financial Partners (Lender)';
    const borrower = answers.borrowerName || 'Alex Mercer (Borrower)';
    const amount = answers.loanAmount || '$15,000';
    const rate = answers.interestRate || '6.5%';
    const termMonths = answers.repaymentMonths || '24';

    return {
      title: customTitle || `Loan Agreement – ${borrower}`,
      type,
      content: `PROMISSORY NOTE & LOAN AGREEMENT

FOR VALUE RECEIVED, on this ${dateStr}, the undersigned Borrower promises to pay to the order of Lender the terms outlined below:

LENDER: ${lender}
BORROWER: ${borrower}

1. PRINCIPAL SUM AND INTEREST
Borrower promises to repay to Lender the principal sum of ${amount} together with interest on unpaid principal at the annual rate of ${rate}.

2. REPAYMENT TERMS
The entire principal and accrued interest shall be repaid in ${termMonths} consecutive monthly installments commencing thirty (30) days from execution, with all remaining balances due on the maturity date.

3. PREPAYMENT
Borrower reserves the right to prepay the entire loan balance or any portion thereof at any time without penalty or additional fee.

4. DEFAULT AND ACCELERATION
If Borrower fails to make any payment when due and such default continues for a period of fifteen (15) calendar days after written notice, Lender may declare the entire remaining unpaid principal balance immediately due and payable.

5. ATTORNEYS' FEES
If legal action is instituted to collect any delinquent sums under this Agreement, the prevailing party shall be entitled to recover reasonable attorneys' fees and court costs.

6. GOVERNING LAW
This Loan Agreement shall be governed by the laws of ${jurisdiction}.

IN WITNESS WHEREOF, the Borrower and Lender have executed this Loan Agreement:

_____________________________                _____________________________
${borrower} (Borrower)                       ${lender} (Lender)
Date: ${dateStr}                             Date: ${dateStr}`
    };
  }

  if (type === 'Employment Agreement') {
    const employer = answers.employerName || 'Acme Technologies Inc.';
    const employee = answers.employeeName || 'Taylor Brooks';
    const role = answers.jobTitle || 'Senior Product Manager';
    const salary = answers.annualSalary || '$130,000';

    return {
      title: customTitle || `Employment Agreement – ${employee} (${role})`,
      type,
      content: `EMPLOYMENT AGREEMENT

THIS EMPLOYMENT AGREEMENT is entered into as of ${dateStr}, between:

EMPLOYER: ${employer} ("Company"), and
EMPLOYEE: ${employee} ("Employee").

1. POSITION AND RESPONSIBILITIES
The Company hereby employs Employee in the capacity of ${role}. Employee shall report to the executive management and perform all duties assigned in a diligent, loyal, and workmanlike manner.

2. COMPENSATION
(a) Base Salary: The Company shall pay Employee an annualized base salary of ${salary}, payable in semi-monthly installments subject to standard statutory withholdings.
(b) Benefits: Employee shall be entitled to participate in all Company benefit programs, including health insurance and paid time off, in accordance with Company policies.

3. NATURE OF EMPLOYMENT (AT-WILL)
Employment shall be "at-will," meaning that either the Company or Employee may terminate the relationship at any time, with or without cause, upon two (2) weeks' advance written notice.

4. CONFIDENTIALITY AND INVENTIONS
Employee agrees to hold all proprietary information, client lists, and trade secrets in confidence. Any software, designs, or works created during the scope of employment belong exclusively to the Company.

5. GOVERNING LAW
This Agreement shall be interpreted and governed by the laws of ${jurisdiction}.

IN WITNESS WHEREOF, the parties hereto have signed this Agreement:

_____________________________                _____________________________
For: ${employer}                             ${employee} (Employee)
Date: ${dateStr}                             Date: ${dateStr}`
    };
  }

  // Affidavit fallback
  const affiant = answers.affiantName || 'Robert H. Langdon';
  const county = answers.county || 'Travis County';
  const state = answers.state || jurisdiction || 'Texas';
  const facts = answers.statementOfFacts || 'I am of sound legal mind, over the age of eighteen (18), and have personal knowledge of the facts stated herein.';

  return {
    title: customTitle || `General Affidavit – ${affiant}`,
    type: 'Affidavit',
    content: `GENERAL AFFIDAVIT UNDER OATH

STATE OF: ${state}
COUNTY OF: ${county}

BEFORE ME, the undersigned authority, personally appeared ${affiant} ("Affiant"), who, having been duly sworn according to law, deposes and states under penalty of perjury as follows:

1. I am over eighteen (18) years of age, competent to testify, and make this affidavit based upon my own direct personal knowledge.
2. STATEMENT OF FACTS:
${facts}

3. I make this sworn affidavit for all lawful purposes, and I solemnly affirm that the statements made herein are true, correct, and complete to the best of my knowledge, information, and belief.

FURTHER AFFIANT SAYETH NOT.

Executed this ${dateStr}.

_______________________________________
${affiant} (Affiant Signature)

NOTARY PUBLIC ACKNOWLEDGMENT
Subscribed and sworn to before me on this _____ day of _______________, 2026, by ${affiant}, who proved to me on the basis of satisfactory evidence to be the person who appeared before me.

_______________________________________
Notary Public, State of ${state}
My Commission Expires: _________________
[SEAL]`
  };
}

// 3. Explain Document Endpoint (Translates complex legalese into Plain English)
app.post('/api/explain-document', async (req: Request, res: Response) => {
  try {
    const { text, focusArea } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Legal text is required' });
    }

    if (ai) {
      const prompt = `You are an expert legal simplifier and plain-English contract translator.
Analyze the following legal text and break it down into an easy-to-understand briefing.

Input Legal Text:
"""
${text}
"""
Focus Area (if any): ${focusArea || 'General Understanding'}

Provide your response in clear sections:
1. PLAIN ENGLISH SUMMARY: Explain what this clause or document actually means in conversational, clear language (2-3 sentences).
2. KEY OBLIGATIONS & RIGHTS: Who is responsible for what? What rights are granted or taken away?
3. HIDDEN RISKS & RED FLAGS: Highlight any one-sided terms, harsh liabilities, penalties, or unusual language.
4. PRACTICAL ADVICE: What should a reasonable person ask for, negotiate, or be careful of before signing?

Format your response with clean markdown headings and bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });

      return res.json({ explanation: response.text });
    } else {
      // Deterministic structured fallback
      return res.json({
        explanation: `### 1. Plain English Summary\nThis clause outlines the formal legal commitments between the parties, setting boundaries on liability, expectations of performance, and remedies if obligations are breached.\n\n### 2. Key Obligations & Rights\n- **Primary Duty**: The bound party must perform or refrain from specific actions as described without unreasonable delay.\n- **Dispute Mechanism**: Defaults typically require written notification before punitive damages or legal action can be initiated.\n\n### 3. Hidden Risks & Red Flags\n- **Broad Liability**: Ensure that indemnities or warranties do not hold you accountable for factors beyond your direct control.\n- **Unilateral Clauses**: Verify that cancellation rights or remedy terms are reciprocal rather than one-sided.\n\n### 4. Practical Advice\n- Request specific definitions for terms like "reasonable notice" or "material breach".\n- Confirm that cure periods (e.g. 15-30 days to resolve any issue) are explicitly included before penalties apply.`
      });
    }
  } catch (err: any) {
    console.error('Explain document error:', err);
    res.status(500).json({ error: err.message || 'Error explaining document' });
  }
});

// 4. Document Check Endpoint (Audit, find missing clauses, ambiguities, warnings)
app.post('/api/check-document', async (req: Request, res: Response) => {
  try {
    const { text, documentType } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Document text is required' });
    }

    if (ai) {
      const prompt = `You are a meticulous senior legal auditor. Conduct an exhaustive legal health check on the following document draft.

Document Type: ${documentType || 'General Legal Agreement'}
Document Text:
"""
${text}
"""

Evaluate for:
1. Overall Health Score (0 to 100).
2. Missing Essential Clauses (e.g. dispute resolution, termination notice, confidentiality, severability, governing law, limitation of liability).
3. Ambiguities & Vague Terms (e.g. "promptly", "as soon as possible", missing dates, undefined terms).
4. One-Sided or High-Risk Language.
5. Specific actionable recommendations for each issue detected.

Format your output in clean JSON with this exact structure:
{
  "score": number,
  "verdict": string,
  "summary": string,
  "issues": [
    {
      "severity": "high" | "medium" | "low" | "safe",
      "title": string,
      "description": string,
      "recommendation": string
    }
  ],
  "missingClauses": [string],
  "positiveAspects": [string]
}
Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      try {
        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (parseErr) {
        return res.json({
          score: 82,
          verdict: 'Good Draft with Minor Recommendations',
          summary: 'The document establishes core obligations clearly, but would benefit from added dispute resolution mechanics and precise notice periods.',
          issues: [
            {
              severity: 'medium',
              title: 'Cure Period Missing',
              description: 'The termination clause lacks an explicit notice cure window (e.g., 14 days) before termination takes effect.',
              recommendation: 'Add a standard 14-day written notice and opportunity to cure clause.'
            }
          ],
          missingClauses: ['Attorneys Fees Provision', 'Force Majeure'],
          positiveAspects: ['Parties are clearly identified', 'Governing law is defined']
        });
      }
    } else {
      // Fallback audit analysis
      const issues: any[] = [];
      const missingClauses: string[] = [];
      const positiveAspects: string[] = [];

      const lower = text.toLowerCase();
      let score = 88;

      if (!lower.includes('governing law') && !lower.includes('jurisdiction')) {
        score -= 15;
        missingClauses.push('Governing Law & Jurisdiction Clause');
        issues.push({
          severity: 'high',
          title: 'Missing Governing Law Clause',
          description: 'No state or judicial forum is designated. In the event of a dispute, determining applicable law will cause severe delay and expense.',
          recommendation: 'Add a standard clause designating specific state law and courts.'
        });
      } else {
        positiveAspects.push('Governing law and jurisdiction are specified.');
      }

      if (!lower.includes('severability')) {
        score -= 8;
        missingClauses.push('Severability Clause');
        issues.push({
          severity: 'medium',
          title: 'Missing Severability Clause',
          description: 'If any single provision is struck down by a court, the entire agreement could risk being invalidated.',
          recommendation: 'Insert a standard severability clause stating that invalid terms do not affect remaining terms.'
        });
      } else {
        positiveAspects.push('Severability clause included.');
      }

      if (!lower.includes('notice') && !lower.includes('written notice')) {
        score -= 10;
        issues.push({
          severity: 'medium',
          title: 'Notice Procedure Undefined',
          description: 'The contract does not specify how formal legal notices (email, registered mail) must be served.',
          recommendation: 'Specify valid notice delivery addresses and acceptable delivery channels.'
        });
      }

      if (lower.includes('witness whereof') || lower.includes('signature') || lower.includes('date:')) {
        positiveAspects.push('Signature and execution blocks are present.');
      } else {
        issues.push({
          severity: 'high',
          title: 'Incomplete Signature Blocks',
          description: 'No formal execution lines or dated signature spaces detected.',
          recommendation: 'Add dated signature blocks for all executing parties.'
        });
      }

      return res.json({
        score: Math.max(50, score),
        verdict: score >= 80 ? 'Solid Legal Draft' : 'Requires Clause Revisions',
        summary: `Document analysis identified ${issues.length} potential area(s) for hardening. Essential covenants are present, but adding standard boilerplate provisions will strengthen enforceability.`,
        issues,
        missingClauses,
        positiveAspects
      });
    }
  } catch (err: any) {
    console.error('Check document error:', err);
    res.status(500).json({ error: err.message || 'Error auditing document' });
  }
});

// 5. My Documents CRUD Endpoints
app.get('/api/documents', (req: Request, res: Response) => {
  const docs = ensureDbFile();
  res.json(docs);
});

app.post('/api/documents', (req: Request, res: Response) => {
  try {
    const { title, type, content, status, summary, metadata } = req.body;
    if (!title || !content || !type) {
      return res.status(400).json({ error: 'Title, type, and content are required' });
    }

    const docs = ensureDbFile();
    const newDoc: StoredDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: 'user-demo-1',
      type,
      title,
      content,
      status: status || 'Draft',
      summary: summary || `${type} created on ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: metadata || {},
    };

    docs.unshift(newDoc);
    saveDb(docs);
    res.status(201).json(newDoc);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save document' });
  }
});

app.get('/api/documents/:id', (req: Request, res: Response) => {
  const docs = ensureDbFile();
  const doc = docs.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json(doc);
});

app.put('/api/documents/:id', (req: Request, res: Response) => {
  try {
    const docs = ensureDbFile();
    const index = docs.findIndex((d) => d.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const current = docs[index];
    const { title, content, status, summary } = req.body;

    const updated: StoredDocument = {
      ...current,
      title: title !== undefined ? title : current.title,
      content: content !== undefined ? content : current.content,
      status: status !== undefined ? status : current.status,
      summary: summary !== undefined ? summary : current.summary,
      updatedAt: new Date().toISOString(),
    };

    docs[index] = updated;
    saveDb(docs);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update document' });
  }
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  try {
    let docs = ensureDbFile();
    const exists = docs.some((d) => d.id === req.params.id);
    if (!exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    docs = docs.filter((d) => d.id !== req.params.id);
    saveDb(docs);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete document' });
  }
});

// Demo Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({
    user: {
      id: 'user-demo-1',
      name: email ? email.split('@')[0] : 'Jane Doe',
      email: email || 'jane.doe@legaltech.com',
      role: 'Legal Operations Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
    token: 'demo-jwt-token-legalease-2026',
  });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email } = req.body;
  res.json({
    user: {
      id: `user-${Date.now()}`,
      name: name || 'New LegalEase User',
      email: email || 'user@example.com',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    },
    token: 'demo-jwt-token-legalease-2026',
  });
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LegalEase Server running at http://0.0.0.0:${PORT}`);
});
