let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  return notes.filter(function (note) {
    return note.text.toLowerCase().includes(word.toLowerCase());
  });
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }
  return longest;
}

function countByCategory() {
  let counts = {};
  for (let i = 0; i < notes.length; i++) {
    let category = notes[i].category;
    if (counts[category]) {
      counts[category]++;
    } else {
      counts[category] = 1;
    }
  }
  return counts;
}

function getSummary() {
  let counts = countByCategory();
  let total = notes.length;

  let personal = counts.personal || 0;
  let work = counts.work || 0;
  let study = counts.study || 0;

  let noteWord = total === 1 ? "note" : "notes";

  return `${total} ${noteWord}: ${personal} personal, ${work} work, ${study} study`;
}

function isDuplicate(text) {
  let newText = text.trim().toLowerCase();
  return notes.some(function (note) {
    return note.text.trim().toLowerCase() === newText;
  });
}

function addNote(text, category) {
  let trimmedText = text.trim();
  let validCategories = ["personal", "work", "study"];

  if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log("Note was not added: text must be 1-200 characters.");
    return false;
  }

  if (isDuplicate(trimmedText)) {
    console.log("Note was not added: duplicate note.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log("Note was not added: invalid category.");
    return false;
  }

  let newNote = {
    id: notes.length + 1,
    text: trimmedText,
    category: category,
  };

  notes.push(newNote);

  console.log("Note added successfully.");
  return true;
}




console.log("searchNotes('javascript'):", searchNotes("javascript"));


console.log("searchNotes('pizza'):", searchNotes("pizza"));

console.log("longestNote():", longestNote());


let savedNotes = notes;
notes = [];

console.log("longestNote() with empty notes:", longestNote());

notes = savedNotes;

console.log("countByCategory():", countByCategory());

let originalNotes = notes;
notes = [];

console.log("countByCategory() with empty notes:", countByCategory());

notes = originalNotes;

console.log("getSummary():", getSummary());

let notesBeforeSummaryTest = notes;
notes = [];

console.log("getSummary() with empty notes:", getSummary());

notes = notesBeforeSummaryTest;

console.log("isDuplicate('Call mum'):", isDuplicate("Call mum"));

console.log("isDuplicate(' CALL MUM '):", isDuplicate(" CALL MUM "));

console.log(
  "addNote('Buy vegetables', 'personal'):",
  addNote("Buy vegetables", "personal"),
);

console.log(
  "addNote(' Buy milk and bread ', 'personal'):",
  addNote(" Buy milk and bread ", "personal"),
);

console.log(
  "addNote('Learn Python', 'coding'):",
  addNote("Learn Python", "coding"),
);

console.log("addNote('', 'study'):", addNote("", "study"));
