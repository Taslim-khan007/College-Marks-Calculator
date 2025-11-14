// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set current date and time
    updateDateTime();
    
    // Add event listeners
    document.getElementById('addSubject').addEventListener('click', addSubject);
    document.getElementById('calculate').addEventListener('click', calculateMarks);
    document.getElementById('generatePDF').addEventListener('click', generatePDF);
    
    // Add a default subject
    addSubject();
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    };
    document.getElementById('dateTime').value = now.toLocaleDateString('en-US', options);
}

let subjectCount = 0;

function addSubject() {
    subjectCount++;
    const subjectsContainer = document.getElementById('subjectsContainer');
    
    const subjectCard = document.createElement('div');
    subjectCard.className = 'subject-card';
    subjectCard.innerHTML = `
        <div class="subject-header">
            <div class="subject-name">Subject ${subjectCount}</div>
            <button type="button" class="remove-subject" onclick="removeSubject(this)">Remove Subject</button>
        </div>
        <div class="marks-inputs">
            <div class="input-field">
                <label>Subject Name</label>
                <input type="text" class="subject-name-input" placeholder="Enter subject name" value="Subject ${subjectCount}">
            </div>
            <div class="input-field">
                <label>1st Mid Term Marks (max 10)</label>
                <input type="number" class="midTerm1" min="0" max="10" placeholder="Enter marks">
            </div>
            <div class="input-field">
                <label>2nd Mid Term Marks (max 10)</label>
                <input type="number" class="midTerm2" min="0" max="10" placeholder="Enter marks">
            </div>
            <div class="input-field">
                <label>Assignment Marks (max 30)</label>
                <input type="number" class="assignment" min="0" max="30" placeholder="Enter marks">
            </div>
            <div class="input-field">
                <label>End Term Marks (max 50)</label>
                <input type="number" class="endTerm" min="0" max="50" placeholder="Enter marks">
            </div>
        </div>
    `;
    
    subjectsContainer.appendChild(subjectCard);
}

function removeSubject(button) {
    if (document.querySelectorAll('.subject-card').length > 1) {
        button.closest('.subject-card').remove();
        // Update subject numbers
        updateSubjectNumbers();
    } else {
        alert('You need at least one subject!');
    }
}

function updateSubjectNumbers() {
    const subjectCards = document.querySelectorAll('.subject-card');
    subjectCount = subjectCards.length;
    
    subjectCards.forEach((card, index) => {
        const subjectNameDiv = card.querySelector('.subject-name');
        const subjectNameInput = card.querySelector('.subject-name-input');
        
        subjectNameDiv.textContent = `Subject ${index + 1}`;
        if (subjectNameInput.value === `Subject ${subjectCount + 1}` || 
            subjectNameInput.value.startsWith('Subject ')) {
            subjectNameInput.value = `Subject ${index + 1}`;
        }
    });
}

function calculateMarks() {
    // Validate student info
    const studentName = document.getElementById('studentName').value.trim();
    const enrollmentNo = document.getElementById('enrollmentNo').value.trim();
    
    if (!studentName || !enrollmentNo) {
        alert('Please enter Student Name and Enrollment Number');
        return;
    }
    
    const subjectCards = document.querySelectorAll('.subject-card');
    const results = [];
    let totalFinalMarks = 0;
    
    // Calculate marks for each subject
    subjectCards.forEach(card => {
        const subjectName = card.querySelector('.subject-name-input').value || 'Unnamed Subject';
        const midTerm1 = parseFloat(card.querySelector('.midTerm1').value) || 0;
        const midTerm2 = parseFloat(card.querySelector('.midTerm2').value) || 0;
        const assignment = parseFloat(card.querySelector('.assignment').value) || 0;
        const endTerm = parseFloat(card.querySelector('.endTerm').value) || 0;
        
        // Calculate final marks: Simple sum of all components
        // Since max marks are: 10 + 10 + 30 + 50 = 100
        const finalMarks = (midTerm1 + midTerm2 + assignment + endTerm).toFixed(2);
        totalFinalMarks += parseFloat(finalMarks);
        
        results.push({
            subjectName,
            midTerm1,
            midTerm2,
            assignment,
            endTerm,
            finalMarks: parseFloat(finalMarks)
        });
    });
    
    // Display results
    displayResults(results, totalFinalMarks);
}

function displayResults(results, totalFinalMarks) {
    const tableBody = document.getElementById('marksTableBody');
    tableBody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.subjectName}</td>
            <td>${result.midTerm1}</td>
            <td>${result.midTerm2}</td>
            <td>${result.assignment}</td>
            <td>${result.endTerm}</td>
            <td>${result.finalMarks}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Update totals
    document.getElementById('totalMarks').innerHTML = `<strong>${totalFinalMarks.toFixed(2)}</strong>`;
    
    const averageMarks = (totalFinalMarks / results.length).toFixed(2);
    document.getElementById('averageMarks').textContent = averageMarks;
    
    // Calculate percentage (out of 100)
    const percentage = ((totalFinalMarks / (results.length * 100)) * 100).toFixed(2);
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    // Show results section
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function generatePDF() {
    // Validate if results are calculated
    const resultsSection = document.getElementById('results');
    if (resultsSection.style.display === 'none') {
        alert('Please calculate marks first before generating PDF');
        return;
    }
    
    const studentName = document.getElementById('studentName').value.trim();
    const enrollmentNo = document.getElementById('enrollmentNo').value.trim();
    const dateTime = document.getElementById('dateTime').value;
    
    // Show loading state
    const pdfButton = document.getElementById('generatePDF');
    const originalText = pdfButton.textContent;
    pdfButton.innerHTML = '<div class="loading"></div> Generating PDF...';
    pdfButton.disabled = true;
    
    // Use html2canvas and jsPDF to generate PDF
    const { jsPDF } = window.jspdf;
    
    // Capture the results section
    html2canvas(resultsSection).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;
        
        // Add header information
        pdf.setFontSize(16);
        pdf.text('VGU Exam Marks', 105, 15, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.text(`Student Name: ${studentName}`, 20, 25);
        pdf.text(`Enrollment No.: ${enrollmentNo}`, 20, 32);
        pdf.text(`Date & Time: ${dateTime}`, 20, 39);
        
        // Add the image
        pdf.addImage(imgData, 'PNG', 0, 45, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add new pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 45;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save the PDF
        pdf.save(`VGU_Exam_Marks_${studentName.replace(/\s+/g, '_')}.pdf`);
        
        // Restore button state
        pdfButton.textContent = originalText;
        pdfButton.disabled = false;
    }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        
        // Restore button state
        pdfButton.textContent = originalText;
        pdfButton.disabled = false;
    });
}

// Add input validation
document.addEventListener('input', function(e) {
    if (e.target.type === 'number') {
        const max = parseInt(e.target.max);
        const value = parseInt(e.target.value);
        
        if (!isNaN(value) && value > max) {
            e.target.value = max;
        }
    }
});