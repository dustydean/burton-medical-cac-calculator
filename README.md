# Burton Medical - Healthcare Lighting CAC Calculator

A specialized Customer Acquisition Cost (CAC) calculator designed for Burton Medical's healthcare lighting solutions. This tool provides industry-specific benchmarks for different healthcare segments, helping optimize marketing spend and sales strategies for medical lighting equipment.

## 🎯 Overview

The Burton Medical CAC Calculator is a customized financial tool that helps healthcare lighting sales teams:
- **Calculate segment-specific CAC** with healthcare industry benchmarks
- **Analyze customer lifetime value** based on equipment replacement cycles
- **Optimize marketing spend** across different healthcare verticals
- **Plan channel strategies** for hospital, clinic, veterinary, and dental markets
- **Model profitability** with medical equipment-specific cost structures

## 🏥 Healthcare Personas

The calculator includes pre-configured benchmarks for four key healthcare segments:

### Hospital OR Administrator
- **Profile**: Regional/community hospital surgical suite decision-makers
- **AOV**: $7,000-10,000+ (multi-head surgical lights, ceiling mounts)
- **Target Net Margin**: 19%
- **Replacement Cycle**: 5-7 years

### Outpatient Clinic Owner
- **Profile**: Private practice or specialty clinic operators
- **AOV**: $2,000-5,000 (exam/procedure lights)
- **Target Net Margin**: 16%
- **Returning Rate**: 25-35%

### Veterinary Surgeon
- **Profile**: Veterinary hospital or surgical clinic operators
- **AOV**: $1,500-3,500 (procedure lights, Outpatient models)
- **Target Net Margin**: 14%
- **Returning Rate**: 30-40%

### Dental/Oral Surgery Director
- **Profile**: Dental or oral surgery clinic leadership
- **AOV**: $3,000-6,000 (precision procedure lights)
- **Target Net Margin**: 17%
- **Returning Rate**: 25-30%

## 🚀 Features

### Core Calculations
- **Healthcare-Specific CAC** - Incorporates installation and compliance costs
- **Equipment Lifecycle Value** - Models based on typical replacement cycles
- **Channel Profitability** - Compare direct sales vs. distributor margins
- **Return on Investment** - Trade show and conference ROI analysis
- **Commission Structures** - Align sales compensation with CAC targets

### Interactive Features
- **Persona Selector** - Quick-load industry benchmarks
- **Real-time Calculations** - Instant updates as you adjust inputs
- **Multi-tab Interface** - Organized data entry by category
- **Waterfall Visualization** - Visual breakdown of unit economics
- **Dark/Light Themes** - Customizable appearance
- **Presentation Mode** - Clean view for client presentations
- **Settings Import/Export** - Save and share configurations

## 🏗️ Technical Architecture

### Application Structure
- **Single Page Application** - Pure HTML/CSS/JavaScript
- **Responsive Design** - Works on desktop and mobile
- **Healthcare-Optimized** - Pre-configured for medical equipment sales
- **Accessibility Compliant** - Screen reader and keyboard navigation support

## 🚀 Getting Started

### Using the Calculator

1. **Open the Calculator**
   - Open `cac-calculator.html` in any modern web browser
   - Or visit: [Burton Medical CAC Calculator](https://dustydean.github.io/burton-medical-cac-calculator)

2. **Select Your Persona**
   - Choose from Hospital OR, Outpatient Clinic, Veterinary, or Dental personas
   - The calculator will automatically load industry-specific benchmarks

3. **Customize Values** (Optional)
   - Fine-tune the pre-loaded values based on your specific market
   - Adjust for regional differences or product variations

4. **View Results**
   - See calculated CAC, CLTV, and profitability metrics
   - Explore calculation details for transparency
   - Use insights for marketing and sales planning

### For Developers

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation
```bash
# Clone the repository
git clone https://github.com/dustydean/burton-medical-cac-calculator.git
cd burton-medical-cac-calculator

# Install test dependencies
npm install
```

#### Running Tests
```bash
# Run unit tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Start local development server
npm run serve
```

## 📁 Project Structure

```
burton-medical-cac-calculator/
├── cac-calculator.html              # Main CAC calculator with persona selector
├── kpi-dashboard-demo.html          # KPI dashboard for sales demonstrations
├── KPI-DASHBOARD-DOCUMENTATION.md   # Comprehensive dashboard documentation
├── research/                        # Market research and company analysis
│   ├── README.md                   # Research documentation guide
│   └── burton-medical-research.pdf # Company background and market analysis
├── verify-math.js                   # Mathematical verification script
├── verify-dashboard-calculations.js # Dashboard calculation validator
├── test-personas.html               # Persona testing interface
└── tests/                          # Unit test suite
    ├── setup.js                    # Jest and JSDOM configuration
    ├── polyfills.js                # Node.js polyfills
    └── unit/                       # Core calculation tests
```

## 📚 Documentation & Research

### Key Documents
- **[KPI Dashboard Documentation](./KPI-DASHBOARD-DOCUMENTATION.md)** - Complete guide to using the KPI dashboard
- **[Research Directory](./research/)** - Market analysis and company research
  - Burton Medical company analysis
  - Healthcare lighting market trends
  - Competitive positioning studies
  - Customer segmentation research

## 🧪 Testing

### Test Coverage
The unit test suite provides comprehensive coverage of all core mathematical functions, ensuring accuracy for healthcare-specific calculations.

### Test Structure
```
tests/
├── setup.js                    # Jest and JSDOM configuration
├── polyfills.js                # Node.js polyfills for browser APIs
├── fixtures/
│   └── testData.js             # Healthcare-specific test scenarios
├── utils/
│   └── calculatorHelpers.js    # Test helper functions
└── unit/
    └── calculations.test.js    # Core calculation function tests
```

## 📊 Use Cases

### Sales Team Planning
- Determine sustainable commission structures by healthcare segment
- Identify highest-ROI customer segments for Burton Medical products
- Plan territory allocation based on segment profitability

### Marketing Strategy
- Evaluate trade show investments against segment-specific CAC benchmarks
- Compare digital marketing vs. traditional healthcare marketing channels
- Optimize marketing mix for different healthcare verticals

### Product Development
- Assess market viability for new lighting product lines
- Understand price sensitivity across healthcare segments
- Plan product features based on segment requirements and margins

## 🤝 Contributing

When contributing to the calculator:
1. **Maintain Healthcare Focus** - Keep enhancements relevant to medical equipment sales
2. **Add Tests** - Include unit tests for any new calculations
3. **Document Personas** - Update persona data with market research
4. **Validate Benchmarks** - Ensure industry data is current and accurate

## 📄 License

MIT License. See LICENSE file for details.

---

**Calculator Version**: 2.0.0 - Burton Medical Edition
**Last Updated**: 2025
**Customized for**: Burton Medical Healthcare Lighting Solutions