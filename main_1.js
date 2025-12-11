/**
 * Digital Logic Simplifier & Verilog Generator
 * Main JavaScript Logic
 */

// Global variables
let variables = ['A', 'B', 'C'];
let truthTable = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Digital Logic Simplifier initialized');
    generateTruthTable();
    
    // Add event listener for variable count change
    document.getElementById('var-count').addEventListener('change', generateTruthTable);
});

/**
 * Generate truth table based on number of variables
 */
function generateTruthTable() {
    const varCount = parseInt(document.getElementById('var-count').value);
    
    // Generate variable names (A, B, C, D, E)
    variables = [];
    for (let i = 0; i < varCount; i++) {
        variables.push(String.fromCharCode(65 + i));
    }

    const numRows = Math.pow(2, varCount);
    truthTable = [];

    // Build table HTML
    let html = '<table class="truth-table"><thead><tr>';
    
    // Add variable headers
    variables.forEach(variable => {
        html += `<th>${variable}</th>`;
    });
    html += '<th>F (Output)</th></tr></thead><tbody>';

    // Generate all binary combinations
    for (let i = 0; i < numRows; i++) {
        html += '<tr>';
        const row = [];
        
        // Generate binary representation for current row
        for (let j = varCount - 1; j >= 0; j--) {
            const bit = (i >> j) & 1;
            row.push(bit);
            html += `<td>${bit}</td>`;
        }
        
        // Add output dropdown
        html += `<td>
            <select class="output-select" onchange="updateOutput(${i}, this.value)">
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="X">X (Don't Care)</option>
            </select>
        </td></tr>`;
        
        row.push('0'); // Default output value
        truthTable.push(row);
    }

    html += '</tbody></table>';
    document.getElementById('truth-table-container').innerHTML = '<div class="table-responsive">' + html + '</div>';

    // Update all dependent sections
    updateAll();
}

/**
 * Update output value for specific row
 */
function updateOutput(rowIndex, value) {
    if (rowIndex >= 0 && rowIndex < truthTable.length) {
        truthTable[rowIndex][variables.length] = value;
        updateAll();
    }
}

/**
 * Clear all output values to 0
 */
function clearTable() {
    truthTable.forEach((row, i) => {
        row[variables.length] = '0';
        const select = document.querySelectorAll('.output-select')[i];
        if (select) {
            select.value = '0';
        }
    });
    updateAll();
    showStatus('Table cleared!');
}

/**
 * Fill table with random values
 */
function randomFill() {
    truthTable.forEach((row, i) => {
        // 60% chance of 1, 30% chance of 0, 10% chance of X
        const rand = Math.random();
        let randomValue;
        if (rand < 0.6) {
            randomValue = '1';
        } else if (rand < 0.9) {
            randomValue = '0';
        } else {
            randomValue = 'X';
        }
        
        row[variables.length] = randomValue;
        const select = document.querySelectorAll('.output-select')[i];
        if (select) {
            select.value = randomValue;
        }
    });
    updateAll();
    showStatus('Random values generated!');
}

/**
 * Update all dependent sections when truth table changes
 */
function updateAll() {
    try {
        generateKMap();
        generateSimplifiedExpression();
        generateVerilogCode();
        generateTestbench();
    } catch (error) {
        console.error('Error updating sections:', error);
        showStatus('Error updating display', 'error');
    }
}

/**
 * Generate K-Map visualization
 */
function generateKMap() {
    const varCount = variables.length;
    let html = '';

    try {
        switch (varCount) {
            case 2:
                html = generateKMap2x2();
                break;
            case 3:
                html = generateKMap2x4();
                break;
            case 4:
                html = generateKMap4x4();
                break;
            case 5:
                html = generateKMap5Var();
                break;
            default:
                html = '<div class="error">Unsupported number of variables</div>';
        }
    } catch (error) {
        console.error('K-Map generation error:', error);
        html = '<div class="error">Error generating K-Map</div>';
    }

    document.getElementById('kmap-container').innerHTML = '<div class="table-responsive">' + html + '</div>';
}

/**
 * Generate 2x2 K-Map (2 variables)
 */
function generateKMap2x2() {
    const grayCode = ['0', '1'];
    let html = '<table class="kmap-table"><thead><tr><th>\\</th>';
    
    grayCode.forEach(col => {
        html += `<th>${variables[1]} = ${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    grayCode.forEach((row, i) => {
        html += `<tr><th>${variables[0]} = ${row}</th>`;
        grayCode.forEach((col, j) => {
            const index = i * 2 + j;
            const value = truthTable[index] ? truthTable[index][variables.length] : '0';
            const cellClass = getCellClass(value);
            html += `<td class="kmap-cell ${cellClass}" title="Row ${index}">${value}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

/**
 * Generate 2x4 K-Map (3 variables)
 */
function generateKMap2x4() {
    const grayCode2 = ['00', '01', '11', '10'];
    let html = '<table class="kmap-table"><thead><tr><th>\\</th>';
    
    grayCode2.forEach(col => {
        html += `<th>${variables[1]}${variables[2]} = ${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    ['0', '1'].forEach((row, i) => {
        html += `<tr><th>${variables[0]} = ${row}</th>`;
        grayCode2.forEach((col, j) => {
            const binCol = grayToBinary(col);
            const index = i * 4 + binCol;
            const value = truthTable[index] ? truthTable[index][variables.length] : '0';
            const cellClass = getCellClass(value);
            html += `<td class="kmap-cell ${cellClass}" title="Minterm ${index}">${value}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

/**
 * Generate 4x4 K-Map (4 variables)
 */
function generateKMap4x4() {
    const grayCode2 = ['00', '01', '11', '10'];
    let html = '<table class="kmap-table"><thead><tr><th>\\</th>';
    
    grayCode2.forEach(col => {
        html += `<th>${variables[2]}${variables[3]} = ${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    grayCode2.forEach((row, i) => {
        html += `<tr><th>${variables[0]}${variables[1]} = ${row}</th>`;
        grayCode2.forEach((col, j) => {
            const rowBin = grayToBinary(row);
            const colBin = grayToBinary(col);
            const index = rowBin * 4 + colBin;
            const value = truthTable[index] ? truthTable[index][variables.length] : '0';
            const cellClass = getCellClass(value);
            html += `<td class="kmap-cell ${cellClass}" title="Minterm ${index}">${value}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

/**
 * Generate display for 5 variables (simplified)
 */
function generateKMap5Var() {
    const minterms = [];
    const dontCares = [];
    
    truthTable.forEach((row, index) => {
        if (row[variables.length] === '1') {
            minterms.push(index);
        } else if (row[variables.length] === 'X') {
            dontCares.push(index);
        }
    });

    let html = '<div class="kmap-5var">';
    html += '<p><strong>5-variable K-maps require two 4×4 maps.</strong></p>';
    html += '<p><strong>Minterms (1):</strong> ' + (minterms.length > 0 ? minterms.join(', ') : 'None') + '</p>';
    html += '<p><strong>Don\'t Cares (X):</strong> ' + (dontCares.length > 0 ? dontCares.join(', ') : 'None') + '</p>';
    html += '</div>';
    
    return html;
}

/**
 * Get CSS class for K-Map cell based on value
 */
function getCellClass(value) {
    switch (value) {
        case '1': return 'one';
        case 'X': return 'dont-care';
        default: return 'zero';
    }
}

/**
 * Convert Gray code to binary
 */
function grayToBinary(gray) {
    const grayMap = {
        '00': 0, '01': 1, '11': 3, '10': 2,
        '0': 0, '1': 1
    };
    return grayMap[gray] || 0;
}

/**
 * Generate simplified Boolean expression
 */
function generateSimplifiedExpression() {
    try {
        const minterms = [];
        const dontCares = [];

        // Extract minterms and don't cares from truth table
        truthTable.forEach((row, index) => {
            if (row[variables.length] === '1') {
                minterms.push(index);
            } else if (row[variables.length] === 'X') {
                dontCares.push(index);
            }
        });

        // Handle special cases
        if (minterms.length === 0 && dontCares.length === 0) {
            updateExpressionDisplay('F = 0', 'F = 0');
            drawLogicDiagram([]); // Draw Logic 0
            return;
        }

        if (minterms.length === truthTable.length) {
            updateExpressionDisplay('F = 1', 'F = 1');
            drawLogicDiagram(['1']); // Draw Logic 1
            return;
        }

        // Apply Quine-McCluskey algorithm
        const simplified = quineMcCluskey(minterms, dontCares, variables.length);
        
        let rawExpression, latexExpression;
        
        if (simplified.length === 0) {
            rawExpression = 'F = 0';
            latexExpression = 'F = 0';
        } else {
            rawExpression = 'F = ' + simplified.join(' + ');
            // Convert to LaTeX format
            const latexTerms = simplified.map(term => 
                term.replace(/'/g, "'")//.replace(/([A-E])/g, '$1')
            );
            latexExpression = 'F = ' + latexTerms.join(' + ') + '';
        }

        updateExpressionDisplay(rawExpression, latexExpression);
        drawLogicDiagram(simplified);
        
    } catch (error) {
        console.error('Expression generation error:', error);
        updateExpressionDisplay('Error generating expression', '$\\text{Error}$');
    }
}

/**
 * Update expression display elements
 */
function updateExpressionDisplay(raw, latex) {
    document.getElementById('raw-expression').textContent = raw;
    document.getElementById('latex-expression').innerHTML = latex;
    
    // Re-render MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([document.getElementById('latex-expression')])
            .catch(err => console.warn('MathJax rendering error:', err));
    }
}

/**
 * Quine-McCluskey algorithm for Boolean minimization
 * Updated to include Prime Implicant Chart Coverage (EPI + Greedy)
 */
function quineMcCluskey(minterms, dontCares, numVars) {
    if (minterms.length === 0) return [];
    
    // 1. Generate Prime Implicants (Existing Logic)
    const allTerms = [...minterms, ...dontCares];
    let terms = allTerms.map(m => ({
        binary: m.toString(2).padStart(numVars, '0'),
        minterms: [m], // Track which minterms this covers
        used: false
    }));

    let groups = [];
    for (let i = 0; i <= numVars; i++) {
        groups[i] = terms.filter(term => countOnes(term.binary) === i);
    }

    const primeImplicants = [];
    let iteration = 0;
    const maxIterations = numVars + 1;

    while (iteration < maxIterations) {
        let combined = false;
        const newGroups = [];
        
        for (let i = 0; i < groups.length - 1; i++) {
            newGroups[i] = [];
            for (let j = 0; j < groups[i].length; j++) {
                for (let k = 0; k < groups[i + 1].length; k++) {
                    const diff = findSingleBitDifference(groups[i][j].binary, groups[i + 1][k].binary);
                    
                    if (diff.found) {
                        const newBinary = groups[i][j].binary.substring(0, diff.position) + 
                                        '-' + groups[i][j].binary.substring(diff.position + 1);
                        
                        // Prevent duplicates in the next stage
                        if (!newGroups[i].some(t => t.binary === newBinary)) {
                            newGroups[i].push({
                                binary: newBinary,
                                // Merge covered minterms lists
                                minterms: [...new Set([
                                    ...groups[i][j].minterms, 
                                    ...groups[i + 1][k].minterms
                                ])],
                                used: false
                            });
                        }
                        
                        groups[i][j].used = true;
                        groups[i + 1][k].used = true;
                        combined = true;
                    }
                }
            }
        }
        
        // Collect unused terms as Prime Implicants
        for (let i = 0; i < groups.length; i++) {
            groups[i].forEach(term => {
                if (!term.used) {
                    // Only add if it covers at least one original minterm (not solely don't cares)
                    if (term.minterms.some(m => minterms.includes(m))) {
                        // Check for duplicates before pushing
                        if (!primeImplicants.some(pi => pi.binary === term.binary)) {
                            primeImplicants.push(term);
                        }
                    }
                }
            });
        }
        
        if (!combined) break;
        groups = newGroups.filter(g => g && g.length > 0);
        iteration++;
    }

    // 2. Optimization Phase: Select Minimum Set of PIs
    // We pass the raw PI objects and the required minterms (excluding don't cares)
    const finalPIs = selectMinimumPrimeImplicants(primeImplicants, minterms);

    // 3. Formatting Phase
    const expressions = finalPIs.map(pi => 
        binaryToExpression(pi.binary, variables)
    );

    return expressions.filter(expr => expr.length > 0);
}

/**
 * Selects the Essential Prime Implicants and uses a greedy approach
 * to cover remaining minterms.
 * @param {Array} pis - All generated Prime Implicants
 * @param {Array} requiredMinterms - Original minterms that MUST be covered (no don't cares)
 */
function selectMinimumPrimeImplicants(pis, requiredMinterms) {
    let finalSelection = [];
    let remainingMinterms = [...requiredMinterms];
    let availablePIs = [...pis];

    // --- STEP 1: Find Essential Prime Implicants (EPIs) ---
    // An EPI is the only PI that covers a specific minterm.
    
    let foundEPI = true;
    while (foundEPI && remainingMinterms.length > 0) {
        foundEPI = false;
        const mintermCounts = {};

        // Count how many PIs cover each remaining minterm
        remainingMinterms.forEach(m => mintermCounts[m] = 0);
        
        availablePIs.forEach(pi => {
            pi.minterms.forEach(m => {
                if (remainingMinterms.includes(m)) {
                    mintermCounts[m]++;
                }
            });
        });

        // Check for minterms covered by exactly 1 PI
        const essentialMinterms = remainingMinterms.filter(m => mintermCounts[m] === 1);
        
        const newlySelectedPIs = [];

        essentialMinterms.forEach(em => {
            // Find the PI responsible
            const epi = availablePIs.find(pi => pi.minterms.includes(em));
            if (epi && !newlySelectedPIs.includes(epi) && !finalSelection.includes(epi)) {
                newlySelectedPIs.push(epi);
            }
        });

        if (newlySelectedPIs.length > 0) {
            foundEPI = true;
            // Add EPIs to final selection
            finalSelection.push(...newlySelectedPIs);
            
            // Remove covered minterms
            newlySelectedPIs.forEach(pi => {
                remainingMinterms = remainingMinterms.filter(m => !pi.minterms.includes(m));
            });

            // Remove used PIs from available list
            availablePIs = availablePIs.filter(pi => !newlySelectedPIs.includes(pi));
        }
    }

    // --- STEP 2: Greedy Coverage for Remaining Minterms ---
    // If minterms remain, pick the PI that covers the MOST remaining minterms.
    // Tie-breaker: Pick the PI with fewest literals (more '-' dashes).

    while (remainingMinterms.length > 0) {
        let bestPI = null;
        let maxCoverCount = -1;

        availablePIs.forEach(pi => {
            // Calculate how many *remaining* minterms this PI covers
            const coverCount = pi.minterms.filter(m => remainingMinterms.includes(m)).length;
            
            if (coverCount > maxCoverCount) {
                maxCoverCount = coverCount;
                bestPI = pi;
            } else if (coverCount === maxCoverCount) {
                // Tie-breaker: Choose PI with fewer literals (simplest hardware)
                // Fewer literals = more dashes ('-') in binary string
                const bestDashes = (bestPI.binary.match(/-/g) || []).length;
                const currentDashes = (pi.binary.match(/-/g) || []).length;
                
                if (currentDashes > bestDashes) {
                    bestPI = pi;
                }
            }
        });

        if (bestPI && maxCoverCount > 0) {
            finalSelection.push(bestPI);
            // Remove newly covered minterms
            remainingMinterms = remainingMinterms.filter(m => !bestPI.minterms.includes(m));
            // Remove used PI
            availablePIs = availablePIs.filter(pi => pi !== bestPI);
        } else {
            // Should not happen if logic is correct and minterms exist
            console.warn("Could not cover remaining minterms:", remainingMinterms);
            break; 
        }
    }

    return finalSelection;
}
/**
 * Count number of 1s in binary string
 */
function countOnes(binary) {
    return binary.split('1').length - 1;
}

/**
 * Find single bit difference between two binary strings
 */
function findSingleBitDifference(a, b) {
    let differences = 0;
    let position = -1;
    
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i] && a[i] !== '-' && b[i] !== '-') {
            differences++;
            if (differences === 1) {
                position = i;
            } else if (differences > 1) {
                return { found: false, position: -1 };
            }
        } else if (a[i] === '-' || b[i] === '-') {
            // Both positions must be don't care for compatibility
            if (a[i] !== b[i]) {
                return { found: false, position: -1 };
            }
        }
    }
    
    return { 
        found: differences === 1, 
        position: position 
    };
}

/**
 * Convert binary representation to Boolean expression
 */
function binaryToExpression(binary, vars) {
    const terms = [];
    
    for (let i = 0; i < binary.length; i++) {
        if (binary[i] === '1') {
            terms.push(vars[i]);
        } else if (binary[i] === '0') {
            terms.push(vars[i] + "'");
        }
        // Skip '-' (don't care positions)
    }
    
    return terms.length > 0 ? terms.join('') : '';
}

/**
 * Generate Verilog module code (Optimized)
 * Uses the simplified expression instead of raw minterms
 */
function generateVerilogCode() {
    try {
        const minterms = [];
        const dontCares = [];
        
        // Extract minterms and dont cares again for the simplifier
        truthTable.forEach((row, index) => {
            if (row[variables.length] === '1') {
                minterms.push(index);
            } else if (row[variables.length] === 'X') {
                dontCares.push(index);
            }
        });

        let expression;
        let comments = [];
        
        // Handle Trivial Cases
        if (minterms.length === 0 && dontCares.length === 0) {
            expression = "1'b0";
            comments.push("    // Function always outputs 0");
        } else if (minterms.length === truthTable.length) {
            expression = "1'b1";
            comments.push("    // Function always outputs 1");
        } else {
            // GET SIMPLIFIED TERMS
            // We reuse the robust logic you just added
            const simplifiedTerms = quineMcCluskey(minterms, dontCares, variables.length);
            
            if (simplifiedTerms.length === 0) {
                 expression = "1'b0"; // Should have been caught above, but safety first
            } else {
                // Convert simplified text terms (e.g., "A'B") into Verilog format (e.g., "(~A & B)")
                const verilogTerms = simplifiedTerms.map(term => {
                    let vTerm = "";
                    for (let i = 0; i < term.length; i++) {
                        const char = term[i];
                        // If it's a variable
                        if (variables.includes(char)) {
                            // Check if next char is ' (prime)
                            if (i + 1 < term.length && term[i+1] === "'") {
                                vTerm += `~${char}`;
                                i++; // Skip the '
                            } else {
                                vTerm += char;
                            }
                            // Add AND operator if not the last item in this term
                            // (We check if there are more variables coming in this string)
                            if (i < term.length - 1) {
                                vTerm += " & ";
                            }
                        }
                    }
                    // Clean up trailing " & " if logic above left one
                    if (vTerm.endsWith(" & ")) vTerm = vTerm.slice(0, -3);
                    
                    return simplifiedTerms.length > 1 ? `(${vTerm})` : vTerm;
                });
                
                expression = verilogTerms.join(' | ');
                comments.push(`    // Optimized Logic Expression`);
            }
        }

        // Build the module code
        const codeLines = [];
        
        codeLines.push("/*");
        codeLines.push(" * Digital Logic Circuit Module");
        codeLines.push(" * Generated by Digital Logic Simplifier");
        codeLines.push(` * Variables: ${variables.join(', ')}`);
        codeLines.push(" */");
        codeLines.push("");
        codeLines.push("module circuit(");
        variables.forEach((v) => {
             codeLines.push(`    input ${v},`);
        });
        codeLines.push("    output F");
        codeLines.push(");");
        codeLines.push("");
        
        comments.forEach(c => codeLines.push(c));
        codeLines.push(`    assign F = ${expression};`);
        codeLines.push("");
        codeLines.push("endmodule");

        document.getElementById('verilog-code').textContent = codeLines.join('\n');
        
    } catch (error) {
        console.error('Verilog generation error:', error);
        document.getElementById('verilog-code').textContent = '// Error generating Verilog code';
    }
}
/**
 * Generate Verilog testbench code
 */
function generateTestbench() {
    try {
        const n = variables.length;
        const totalCombinations = Math.pow(2, n);
        
        // Build the testbench code as an array for better control
        const codeLines = [];
        
        // Module declaration
        codeLines.push("module tb_circuit;");
        codeLines.push("    // Declare test signals");
        codeLines.push(`    reg ${variables.join(', ')};`);
        codeLines.push("    wire F;");
        codeLines.push("    ");
        
        // Module instantiation
        codeLines.push("    // Instantiate the circuit under test");
        codeLines.push("    circuit uut(");
        variables.forEach((v, index) => {
            if (index < variables.length - 1) {
                codeLines.push(`        .${v}(${v}),`);
            } else {
                codeLines.push(`        .${v}(${v}),`);
            }
        });
        codeLines.push("        .F(F)");
        codeLines.push("    );");
        codeLines.push("    ");
        
        // Variable declarations
        codeLines.push("    integer i;");
        codeLines.push("    ");
        
        // Main test sequence
        codeLines.push("    initial begin");
        codeLines.push("        // Display header");
        codeLines.push('        $display("==============================================");');
        codeLines.push('        $display("Digital Logic Circuit Testbench");');
        codeLines.push('        $display("==============================================");');
        codeLines.push(`        $display("Time\\t${variables.join('\\t')}\\tF");`);
        codeLines.push('        $display("------------------------------");');
        codeLines.push("        ");
        
        codeLines.push("        // Test all input combinations");
        codeLines.push(`        for(i = 0; i < ${totalCombinations}; i = i + 1) begin`);
        codeLines.push(`            {${variables.join(', ')}} = i[${n-1}:0];`);
        codeLines.push("            #10; // Wait 10 time units");
        codeLines.push(`            $display("%0t\\t${variables.map(() => '%b').join('\\t')}\\t%b",`);
        codeLines.push(`                     $time, ${variables.join(', ')}, F);`);
        codeLines.push("        end");
        codeLines.push("        ");
        
        codeLines.push('        $display("------------------------------");');
        codeLines.push('        $display("Testbench completed successfully!");');
        codeLines.push("        $finish;");
        codeLines.push("    end");
        codeLines.push("    ");
        
        // Monitor block
        codeLines.push("    // Optional: Monitor changes");
        codeLines.push("    initial begin");
        codeLines.push(`        $monitor("At time %0t: ${variables.map(v => `${v}=%b`).join(', ')}, F=%b",`);
        codeLines.push(`                 $time, ${variables.join(', ')}, F);`);
        codeLines.push("    end");
        codeLines.push("    ");
        
        // VCD dump block
        codeLines.push("    // Generate VCD file for waveform viewing");
        codeLines.push("    initial begin");
        codeLines.push('        $dumpfile("circuit_tb.vcd");');
        codeLines.push("        $dumpvars(0, tb_circuit);");
        codeLines.push("    end");
        codeLines.push("    ");
        
        codeLines.push("endmodule");
        codeLines.push("");
        
        // Add compilation instructions
        codeLines.push("/*");
        codeLines.push(" * Compilation and Simulation Instructions:");
        codeLines.push(" * ");
        codeLines.push(" * Using Icarus Verilog:");
        codeLines.push(" *   iverilog -o circuit_sim circuit.v tb_circuit.v");
        codeLines.push(" *   vvp circuit_sim");
        codeLines.push(" * ");
        codeLines.push(" * For waveform viewing:");
        codeLines.push(" *   gtkwave circuit_tb.vcd");
        codeLines.push(" * ");
        codeLines.push(" * Using ModelSim:");
        codeLines.push(" *   vlog circuit.v tb_circuit.v");
        codeLines.push(' *   vsim -c tb_circuit -do "run -all; quit"');
        codeLines.push(" */");

        // Join all lines with newlines
        const testbenchCode = codeLines.join('\n');
        document.getElementById('testbench-code').textContent = testbenchCode;
        
    } catch (error) {
        console.error('Testbench generation error:', error);
        document.getElementById('testbench-code').textContent = '// Error generating testbench code\n// Please check your truth table';
    }
}

/**
 * Copy content to clipboard
 */
async function copyToClipboard(elementId) {
    try {
        const element = document.getElementById(elementId);
        const text = element.textContent;
        
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers or insecure contexts
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback copy failed:', err);
                throw new Error('Copy operation failed');
            } finally {
                textArea.remove();
            }
        }
        
        showStatus('📋 Copied to clipboard!');
        
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        showStatus('❌ Failed to copy to clipboard', 'error');
    }
}

/**
 * Download file with given content
 */
function downloadFile(filename, elementId) {
    try {
        const element = document.getElementById(elementId);
        const text = element.textContent;
        
        // Create blob with UTF-8 encoding
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up object URL
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 100);
        
        showStatus(`⬇️ Downloaded ${filename}!`);
        
    } catch (error) {
        console.error('Download failed:', error);
        showStatus('❌ Download failed', 'error');
    }
}

/**
 * Show status message to user
 */
function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status-message');
    
    // Set message and styling
    statusEl.textContent = message;
    statusEl.className = 'status-message';
    
    if (type === 'error') {
        statusEl.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
    } else {
        statusEl.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    }
    
    // Show message with animation
    statusEl.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusEl.classList.remove('show');
    }, 3000);
}

/**
 * Utility function to validate truth table
 */
function validateTruthTable() {
    if (!truthTable || truthTable.length === 0) {
        throw new Error('Truth table is empty');
    }
    
    const expectedRows = Math.pow(2, variables.length);
    if (truthTable.length !== expectedRows) {
        throw new Error(`Truth table should have ${expectedRows} rows, but has ${truthTable.length}`);
    }
    
    // Validate each row
    truthTable.forEach((row, index) => {
        if (!row || row.length !== variables.length + 1) {
            throw new Error(`Invalid row ${index}: expected ${variables.length + 1} columns`);
        }
        
        const outputValue = row[variables.length];
        if (!['0', '1', 'X'].includes(outputValue)) {
            throw new Error(`Invalid output value "${outputValue}" in row ${index}`);
        }
    });
    
    return true;
}

/**
 * Export truth table as JSON
 */
function exportTruthTable() {
    try {
        validateTruthTable();
        
        const exportData = {
            variables: variables,
            truthTable: truthTable,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile('truth_table.json', 'temp-export');
        
        // Temporarily store in a hidden element for download
        const tempElement = document.createElement('div');
        tempElement.id = 'temp-export';
        tempElement.style.display = 'none';
        tempElement.textContent = jsonString;
        document.body.appendChild(tempElement);
        
        downloadFile('truth_table.json', 'temp-export');
        document.body.removeChild(tempElement);
        
    } catch (error) {
        console.error('Export failed:', error);
        showStatus('❌ Export failed', 'error');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl+R: Random fill
    if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        randomFill();
    }
    
    // Ctrl+Shift+C: Clear table
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        clearTable();
    }
    
    // Ctrl+G: Generate new table
    if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        generateTruthTable();
    }
});

// Add error handling for window errors
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showStatus('❌ An error occurred', 'error');
});

// Performance monitoring
const performance = {
    start: Date.now(),
    
    measure: function(label) {
        const now = Date.now();
        console.log(`${label}: ${now - this.start}ms`);
        this.start = now;
    }
};

/**
 * Logic Circuit Diagram Generator
 * Renders Standard SOP Schematic using SVG
 */
function drawLogicDiagram(terms) {
    const container = document.getElementById('circuit-container');
    
    // Handle trivial cases
    if (!terms || terms.length === 0 || (terms.length === 1 && terms[0] === '0')) {
        container.innerHTML = '<div style="text-align:center; padding:20px; font-weight:bold; color:#555;">Output is always Logic 0 (Ground)</div>';
        return;
    }
    if (terms.length === 1 && terms[0] === '1') {
        container.innerHTML = '<div style="text-align:center; padding:20px; font-weight:bold; color:#555;">Output is always Logic 1 (VCC)</div>';
        return;
    }

    // Configuration
    const config = {
        gridX: 40,      // Horizontal spacing
        gridY: 60,      // Vertical spacing per term
        railSpacing: 30,
        gateWidth: 60,
        gateHeight: 40,
        notSize: 15,
        padding: 40
    };

    // Parse terms into structured data
    const parsedTerms = terms.map(term => {
        const literals = [];
        for (let i = 0; i < variables.length; i++) {
            const char = variables[i];
            if (term.includes(char)) {
                // Check if inverted (next char is ')
                const idx = term.indexOf(char);
                const inverted = term[idx + 1] === "'";
                literals.push({ varIndex: i, inverted });
            }
        }
        return literals;
    });

    // Calculate Dimensions
    const numInputs = variables.length;
    const numAndGates = parsedTerms.length;
    const railsWidth = numInputs * config.railSpacing;
    const wiresLength = 40;
    
    // SVG Dimensions
    const width = railsWidth + wiresLength + config.gateWidth + 80 + (numAndGates > 1 ? config.gateWidth : 0) + config.padding * 2;
    const height = Math.max(numAndGates * config.gridY, numInputs * 50) + config.padding * 2;
    
    // Create SVG
    let svg = `<svg class="logic-circuit" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;

    // Define Arrow Marker for lines
    svg += `<defs>
        <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
            <circle cx="3" cy="3" r="2.5" fill="#333" />
        </marker>
    </defs>`;

    const startX = config.padding;
    const startY = config.padding;

    // 1. Draw Vertical Input Rails
    variables.forEach((v, i) => {
        const x = startX + i * config.railSpacing;
        // Label
        svg += `<text x="${x}" y="${startY - 15}" class="circuit-text">${v}</text>`;
        // Rail line
        svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${height - config.padding}" class="circuit-wire" style="stroke: #999; stroke-width: 1.5;" />`;
    });

    // 2. Draw AND Gates (Product Terms)
    const andGateOutputX = startX + railsWidth + wiresLength + config.gateWidth;
    const andGateOutputCoords = [];

    parsedTerms.forEach((literals, index) => {
        // Center the gate in its vertical slot
        const gateY = startY + index * config.gridY + (config.gridY - config.gateHeight) / 2;
        const gateX = startX + railsWidth + wiresLength;
        const gateCenterY = gateY + config.gateHeight / 2;

        // Draw Input Connections
        literals.forEach((lit, litIndex) => {
            const railX = startX + lit.varIndex * config.railSpacing;
            // Distribute inputs on the gate face
            const inputOffset = (config.gateHeight / (literals.length + 1)) * (litIndex + 1);
            const connectionY = gateY + inputOffset;

            // Horizontal wire from rail to gate
            let endWireX = gateX;
            
            // Draw connection dot on rail
            svg += `<circle cx="${railX}" cy="${connectionY}" r="3" class="circuit-dot" />`;

            // If inverted, add NOT bubble/gate
            if (lit.inverted) {
                const notX = gateX - config.notSize - 5;
                // Wire up to NOT
                svg += `<line x1="${railX}" y1="${connectionY}" x2="${notX}" y2="${connectionY}" class="circuit-wire" />`;
                // Draw Triangle
                svg += `<path d="M ${notX},${connectionY-6} L ${notX+10},${connectionY} L ${notX},${connectionY+6} Z" class="circuit-gate-body circuit-gate-fill" />`;
                // Draw Bubble
                svg += `<circle cx="${notX+12}" cy="${connectionY}" r="2.5" class="circuit-gate-body circuit-gate-fill" />`;
                // Short wire from bubble to gate
                svg += `<line x1="${notX+15}" y1="${connectionY}" x2="${gateX}" y2="${connectionY}" class="circuit-wire" />`;
            } else {
                // Direct wire
                svg += `<line x1="${railX}" y1="${connectionY}" x2="${gateX}" y2="${connectionY}" class="circuit-wire" />`;
            }
        });

        // Draw AND Gate Shape
        if (literals.length === 1) {
            // Special case: Single literal term is just a wire buffer (logic-wise), 
            // but for visualization consistency we draw a buffer or wire.
            // If it's a single literal like "A", standard SOP drawing typically just passes it to OR.
            // But we will draw a buffer-like box or pass-through to keep grid consistent.
            // Actually, "A" in SOP is A AND 1, so an AND gate with 1 input is valid visually as a buffer.
            svg += drawAndShape(gateX, gateY, config.gateWidth, config.gateHeight);
        } else {
            svg += drawAndShape(gateX, gateY, config.gateWidth, config.gateHeight);
        }

        andGateOutputCoords.push({ x: andGateOutputX, y: gateCenterY });
    });

    // 3. Draw OR Gate (Sum)
    if (parsedTerms.length > 1) {
        const orGateX = andGateOutputX + 40; // Spacing between stages
        // Center OR gate vertically relative to all AND gates
        const totalHeight = (parsedTerms.length * config.gridY);
        const orGateY = startY + (totalHeight - config.gateHeight) / 2;
        const orGateCenterY = orGateY + config.gateHeight / 2;

        // Draw connections from AND outputs to OR inputs
        andGateOutputCoords.forEach((coord, i) => {
            // Calculate target Y on OR gate curve
            // We'll distribute them evenly on the back of the OR gate
            const inputOffset = (config.gateHeight / (andGateOutputCoords.length + 1)) * (i + 1);
            const targetY = orGateY + inputOffset;
            const targetX = orGateX + 5; // Curve inset

            // Draw Orthogonal paths
            svg += `<path d="M ${coord.x},${coord.y} H ${orGateX - 20} V ${targetY} H ${targetX}" class="circuit-wire" fill="none" />`;
        });

        // Draw OR Gate
        svg += drawOrShape(orGateX, orGateY, config.gateWidth, config.gateHeight);

        // Final Output Wire
        svg += `<line x1="${orGateX + config.gateWidth}" y1="${orGateCenterY}" x2="${width - 10}" y2="${orGateCenterY}" class="circuit-wire" />`;
        svg += `<text x="${width - 10}" y="${orGateCenterY - 10}" class="circuit-text">F</text>`;

    } else if (parsedTerms.length === 1) {
        // Just one term, extend output wire directly
        const coord = andGateOutputCoords[0];
        svg += `<line x1="${coord.x}" y1="${coord.y}" x2="${width - 20}" y2="${coord.y}" class="circuit-wire" />`;
        svg += `<text x="${width - 10}" y="${coord.y - 10}" class="circuit-text">F</text>`;
    }

    svg += '</svg>';
    container.innerHTML = svg;
}

// --- Helper Functions for Shapes ---

function drawAndShape(x, y, w, h) {
    // Standard D shape
    return `<path d="M ${x},${y} L ${x + w/2},${y} A ${h/2},${h/2} 0 0 1 ${x + w/2},${y + h} L ${x},${y + h} Z" class="circuit-gate-body circuit-gate-fill" />`;
}

function drawOrShape(x, y, w, h) {
    // Curved back, pointed front
    // Using Quadratic Bezier curves
    return `<path d="M ${x},${y} 
            Q ${x + w/2},${y} ${x + w},${y + h/2} 
            Q ${x + w/2},${y + h} ${x},${y + h} 
            Q ${x + w/4},${y + h/2} ${x},${y} Z" 
            class="circuit-gate-body circuit-gate-fill" />`;
}

console.log('🔹 Digital Logic Simplifier loaded successfully!');