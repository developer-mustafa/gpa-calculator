$(document).ready(function () {
  let subjects = [];
  let optionalSubjects = [];

  // Load data from local storage on page load
  loadFromLocalStorage();

  $("#addSubjectButton").click(function () {
    addSubject();
    // Save data to local storage after adding a subject
    saveToLocalStorage();
  });

  // Event listener for the export button
  $("#exportButton").click(function () {
    exportAsImage();
  });

  function addSubject() {
    const subjectName = $("#subjectName").val();
    const subjectGrade = $("#subjectGrade").val();
    const isOptional = $("#optionalSubject").prop("checked");

    // Check if the same subject is already added
    if (subjectAlreadyAdded(subjectName)) {
      $("#warningMessage").text("Warning: This Subject already added.");
      return;
    } else {
      $("#warningMessage").text("");
    }

    if (subjectName && subjectGrade) {
      const individualSubjectPoint = calculatePoint(subjectGrade);

      if (isOptional) {
        optionalSubjects.push({
          name: subjectName,
          grade: subjectGrade,
          point: individualSubjectPoint,
        });
      } else {
        subjects.push({
          name: subjectName,
          grade: subjectGrade,
          point: individualSubjectPoint,
        });
      }

      updateSubjectList();

      // Get values from input fields
      const stdName = $("#studentName").val();
      const stdClass = $("#classRoll").val();
      const stdRoll = $("#classRoll").val();

      // Set values to display
      $("#show-name").text(`${stdName}`);
      $("#show-class").text(`${stdClass}`);
      $("#show-roll").text(`${stdRoll}`);

      // Save name, class, and roll to local storage
      localStorage.setItem('stdName', stdName);
      localStorage.setItem('stdClass', stdClass);
      localStorage.setItem('stdRoll', stdRoll);

      updateGPA();
    }
  }

  function subjectAlreadyAdded(subjectName) {
    return (
      subjects.some((subject) => subject.name === subjectName) ||
      optionalSubjects.some((subject) => subject.name === subjectName)
    );
  }

  function updateSubjectList() {
    const tbody = $("#subjectList tbody");
    tbody.empty();

    for (const subject of subjects) {
      const row = `<tr class="trow">
          <td class="">${subject.name}</td>
          <td class="">${subject.grade}</td>
          <td class="">${subject.point}</td>
        </tr>`;
      tbody.append(row);
    }

    for (const subject of optionalSubjects) {
      const row = `<tr class="trow">
          <td class="">${subject.name} (Optional)</td>
          <td class="">${subject.grade}</td>
          <td class="">${subject.point}</td>
        </tr>`;
      tbody.append(row);
    }
  }

  function calculatePoint(grade) {
    switch (grade) {
      case "A+":
        return 5.0;
      case "A":
        return 4.0;
      case "A-":
        return 3.5;
      case "B":
        return 3.0;
      case "C":
        return 2.0;
      case "D":
        return 1.0;
      case "F":
        // If any main individual subject has F grade, set total grade to F
        $("#gpaValue").text("0.00");
        $("#finalGradePoint").text("0.00");
        $("#finalGrade").text("F");
        return 0.0;
      default:
        return 0.0;
    }
  }

  function updateGPA() {
    let totalPoints = 0;
    let mainSubjectCount = 0;
    let hasFGrade = false;

    for (const subject of subjects) {
      totalPoints += subject.point;
      mainSubjectCount++;

      // Check if any main individual subject has F grade
      if (subject.grade === "F") {
        hasFGrade = true;
      }
    }

    if (hasFGrade) {
      // If any main individual subject has F grade, set total grade to F
      $("#gpaValue").text("0.00");
      $("#finalGradePoint").text("0.00");
      $("#finalGrade").text("F");
      return;
    }

    for (const subject of optionalSubjects) {
      const bonusPoints = calculateBonusPoints(subject.grade);
      totalPoints += subject.point + bonusPoints;
    }

    // Cap GPA at 5.00
    const gpa =
      mainSubjectCount > 0
        ? Math.min(totalPoints / mainSubjectCount, 5.0)
        : 0.0;

    // Calculate final grade point
    const finalGradePoint = gpa;

    // Calculate final grade
    const finalGrade = calculateFinalGrade(finalGradePoint);

    $("#gpaValue").text(gpa.toFixed(2));
    $("#finalGradePoint").text(finalGradePoint.toFixed(2));
    $("#finalGrade").text(finalGrade);
  }

  function calculateBonusPoints(grade) {
    switch (grade) {
      case "A+":
        return 3.0; // Bonus 3 points for A+
      case "A":
        return 2.0; // Bonus 2 points for A
      case "A-":
        return 1.0; // Bonus 1 point for A-
      default:
        return 0.0;
    }
  }

  function calculateFinalGrade(finalGradePoint) {
    if (finalGradePoint >= 4.0) {
      return "A+";
    } else if (finalGradePoint >= 3.5) {
      return "A";
    } else if (finalGradePoint >= 3.0) {
      return "A-";
    } else if (finalGradePoint >= 2.0) {
      return "B";
    } else if (finalGradePoint >= 1.0) {
      return "C";
    } else if (finalGradePoint > 0.0) {
      return "D";
    } else {
      return "F";
    }
  }

  function exportAsImage() {
    // Get the wrapper element instead of the table
    const wrapper = document.querySelector("#export");

    // Use html2canvas to capture the wrapper as an image
    html2canvas(wrapper, { scale: 10 }).then(function (canvas) {
      // Convert the canvas to data URL
      const imageDataUrl = canvas.toDataURL("image/jpeg");

      // Create a link element and trigger a download
      const link = document.createElement("a");
      link.href = imageDataUrl;
      link.download = "marksheet.jpg";
      link.click();
    });
  }

  function loadFromLocalStorage() {
    // Load subjects and optionalSubjects arrays from local storage
    const storedSubjects = localStorage.getItem('subjects');
    const storedOptionalSubjects = localStorage.getItem('optionalSubjects');
    const stdName = localStorage.getItem('stdName');
    const stdClass = localStorage.getItem('stdClass');
    const stdRoll = localStorage.getItem('stdRoll');

    subjects = storedSubjects ? JSON.parse(storedSubjects) : [];
    optionalSubjects = storedOptionalSubjects ? JSON.parse(storedOptionalSubjects) : [];

    // Update the subject list after loading from local storage
    updateSubjectList();
    // Update GPA after loading from local storage
    updateGPA();

    // Display name, class, and roll from local storage
    if (stdName) $("#show-name").text(`${stdName}`);
    if (stdClass) $("#show-class").text(` ${stdClass}`);
    if (stdRoll) $("#show-roll").text(`${stdRoll}`);
  }

  function saveToLocalStorage() {
    // Save subjects and optionalSubjects arrays to local storage
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('optionalSubjects', JSON.stringify(optionalSubjects));
  }
});
