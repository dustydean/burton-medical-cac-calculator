# GitHub Issues to Create

Copy and paste these into GitHub Issues at: https://github.com/dustydean/cac-calculator/issues/new

---

## Issue 1: Add User Notification System

**Title:** `🚨 Add user notification system for unrealistic business scenarios`

**Body:**
```markdown
## Problem
The calculator silently sets CAC to zero when target margins are too high, leaving users confused about why their results changed.

## Solution
Implement a notification system that warns users when:
- Target net margin is too high (causing negative CAC)
- Business parameters result in unrealistic scenarios
- Calculations are automatically adjusted

## Acceptance Criteria
- [ ] Display warning when `profitDrivenCAC < 0` is set to 0
- [ ] Show notification: "Target net margin too high for current unit economics"
- [ ] Provide actionable guidance (reduce margin or improve profits)
- [ ] Visual warning indicators in the UI

## Priority
High - Affects user understanding of results

## Labels
`enhancement`, `user-experience`, `high-priority`
```

---

## Issue 2: Improve Input Validation

**Title:** `✅ Improve input validation for edge cases and extreme values`

**Body:**
```markdown
## Problem
Users can enter invalid combinations that break calculations or produce misleading results.

## Solution
Add comprehensive input validation for:
- Zero conversion rates
- Extreme values that cause calculation errors
- Impossible business parameter combinations

## Acceptance Criteria
- [ ] Validate conversion rates (prevent division by zero in CPL)
- [ ] Check for realistic value ranges on all inputs
- [ ] Prevent impossible combinations (e.g., target margin > contribution margin)
- [ ] Show real-time validation feedback as users type
- [ ] Provide suggested value ranges for each field

## Priority
Medium - Prevents user errors

## Labels
`enhancement`, `validation`, `medium-priority`
```

---

## Issue 3: Add Warning Indicators

**Title:** `⚠️ Add visual warning indicators for problematic calculations`

**Body:**
```markdown
## Problem
Users don't realize when their inputs produce concerning or adjusted results.

## Solution
Add visual indicators when:
- CAC is automatically set to zero
- Results show N/A due to mathematical limitations
- Input combinations produce unrealistic outcomes

## Acceptance Criteria
- [ ] Color-coded result fields (red for warnings, yellow for caution)
- [ ] Warning icons next to problematic results
- [ ] Visual highlighting of inputs causing issues
- [ ] Clear distinction between intentional zeros and automatic adjustments

## Priority
Medium - Improves user awareness

## Labels
`enhancement`, `ui-ux`, `medium-priority`
```

---

## Issue 4: Form Validation Feedback

**Title:** `📝 Implement real-time form validation with user feedback`

**Body:**
```markdown
## Problem
Users can enter invalid data without immediate feedback, leading to confusion.

## Solution
Implement real-time validation with:
- Immediate feedback as users type
- Clear error messages for invalid ranges
- Suggestions for realistic values

## Acceptance Criteria
- [ ] Real-time validation on input blur/change
- [ ] Error messages below invalid fields
- [ ] Suggested ranges for each business parameter
- [ ] Prevention of form submission with invalid data
- [ ] Help text explaining realistic value ranges

## Priority
Low - Quality of life improvement

## Labels
`enhancement`, `validation`, `low-priority`
```

---

## Issue 5: Add Explanatory Tooltips

**Title:** `💡 Add tooltips explaining calculation results and limitations`

**Body:**
```markdown
## Problem
Users don't understand why results show "N/A" or zero values.

## Solution
Add informative tooltips that explain:
- Why certain results show "N/A"
- When zero values are expected vs problematic
- Calculation limitations and assumptions

## Acceptance Criteria
- [ ] Tooltips on all result fields explaining their meaning
- [ ] Context-specific explanations for N/A values
- [ ] Help text for calculation limitations
- [ ] Hover/click tooltips with detailed explanations
- [ ] Mobile-friendly tooltip implementation

## Priority
Low - User education

## Labels
`enhancement`, `documentation`, `user-education`, `low-priority`
```