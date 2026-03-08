import { db } from "./db";
import { lessons, vocabularyWords } from "@shared/schema";

export async function seedDatabase() {
  const existingLessons = await db.select().from(lessons);
  if (existingLessons.length > 0) return;

  const seedLessons = [
    {
      title: "Business Meetings: Part 1",
      description: "Learn essential vocabulary for introducing yourself and presenting ideas in a professional setting.",
      cefrLevel: "B1",
      durationMinutes: 15,
      sortOrder: 1,
      content: {
        steps: [
          {
            type: "intro",
            aiMessage: "Hi there! Today we're going to practice introducing yourself in a business meeting. Let's start with a warm-up. Listen carefully and repeat after me.",
            targetSentence: "Hello everyone, my name is Alex and I'm the lead designer.",
          },
          {
            type: "vocabulary",
            aiMessage: "Great job! Now let's look at some key vocabulary for meetings. Click on the cards to hear the pronunciation.",
            words: [
              { word: "Agenda", meaning: "A list of items to be discussed at a formal meeting.", example: "Let's review the agenda before we begin." },
              { word: "Objective", meaning: "A goal or purpose.", example: "Our main objective is to increase sales." },
              { word: "Colleague", meaning: "A person with whom one works.", example: "I'd like to introduce my colleague, Sarah." },
            ],
          },
          {
            type: "fill-blank",
            aiMessage: "Let's test your understanding. Fill in the blank with the correct word.",
            question: "Before we begin, let's quickly review the _______ for today's meeting.",
            options: ["Colleague", "Agenda", "Objective"],
            answer: "Agenda",
          },
          {
            type: "multiple-choice",
            aiMessage: "One more question. Choose the best answer.",
            question: "What does 'objective' mean in a business context?",
            options: ["A person you work with", "A goal or purpose", "A list of discussion items", "A type of presentation"],
            answer: "A goal or purpose",
          },
        ],
      },
    },
    {
      title: "Grammar: Present Perfect",
      description: "Master the usage of 'have been' and 'has done' in conversational contexts.",
      cefrLevel: "B1",
      durationMinutes: 20,
      sortOrder: 2,
      content: {
        steps: [
          {
            type: "intro",
            aiMessage: "Welcome! Today we'll practice the Present Perfect tense. This is used to talk about experiences and things that started in the past and continue to the present.",
            targetSentence: "I have worked here for three years.",
          },
          {
            type: "vocabulary",
            aiMessage: "Let's review some common time expressions used with the Present Perfect.",
            words: [
              { word: "Since", meaning: "From a specific point in time until now.", example: "I have lived here since 2020." },
              { word: "For", meaning: "A duration of time.", example: "She has studied English for five years." },
              { word: "Already", meaning: "Before now or earlier than expected.", example: "I have already finished my homework." },
              { word: "Yet", meaning: "Up until now (used in negatives and questions).", example: "Have you eaten lunch yet?" },
            ],
          },
          {
            type: "fill-blank",
            aiMessage: "Now try this exercise. Which word completes the sentence?",
            question: "I have lived in London _______ 2018.",
            options: ["for", "since", "already", "yet"],
            answer: "since",
          },
          {
            type: "unscramble",
            aiMessage: "Rearrange these words to form a correct sentence.",
            scrambledWords: ["have", "I", "to", "been", "Paris", "never"],
            correctOrder: ["I", "have", "never", "been", "to", "Paris"],
          },
        ],
      },
    },
    {
      title: "Everyday Conversations",
      description: "Practice common phrases for daily interactions at shops, restaurants, and offices.",
      cefrLevel: "A2",
      durationMinutes: 15,
      sortOrder: 3,
      content: {
        steps: [
          {
            type: "intro",
            aiMessage: "Hello! In this lesson, we'll practice everyday conversations. Let's start by ordering food at a restaurant. Repeat after me!",
            targetSentence: "Could I have a glass of water, please?",
          },
          {
            type: "vocabulary",
            aiMessage: "Here are some useful phrases for ordering at a restaurant.",
            words: [
              { word: "Menu", meaning: "A list of food and drinks available.", example: "Can I see the menu, please?" },
              { word: "Bill", meaning: "The total amount of money to pay.", example: "Could we have the bill, please?" },
              { word: "Reservation", meaning: "An arrangement to have something kept for you.", example: "I have a reservation for two at 7pm." },
            ],
          },
          {
            type: "multiple-choice",
            aiMessage: "What would you say to ask for the check at a restaurant?",
            question: "You've finished your meal. What do you say?",
            options: ["Can I see the menu?", "Could we have the bill, please?", "I have a reservation.", "What do you recommend?"],
            answer: "Could we have the bill, please?",
          },
        ],
      },
    },
    {
      title: "Travel English",
      description: "Essential vocabulary and phrases for traveling, including airports, hotels, and directions.",
      cefrLevel: "A2",
      durationMinutes: 15,
      sortOrder: 4,
      content: {
        steps: [
          {
            type: "intro",
            aiMessage: "Today we'll learn useful phrases for traveling. Let's start at the airport. Repeat this sentence.",
            targetSentence: "Excuse me, where is the departure gate?",
          },
          {
            type: "vocabulary",
            aiMessage: "Here are key travel vocabulary words.",
            words: [
              { word: "Boarding pass", meaning: "A card you need to get on the airplane.", example: "Please show your boarding pass at the gate." },
              { word: "Luggage", meaning: "Bags and suitcases you travel with.", example: "My luggage was lost during the flight." },
              { word: "Terminal", meaning: "A building at an airport for passengers.", example: "International flights depart from Terminal 3." },
            ],
          },
          {
            type: "fill-blank",
            aiMessage: "Complete this sentence with the correct word.",
            question: "Please show your _______ at the gate before boarding.",
            options: ["Luggage", "Terminal", "Boarding pass"],
            answer: "Boarding pass",
          },
        ],
      },
    },
    {
      title: "Email Writing: Professional",
      description: "Learn to write clear, professional emails with the right tone and structure.",
      cefrLevel: "B2",
      durationMinutes: 20,
      sortOrder: 5,
      content: {
        steps: [
          {
            type: "intro",
            aiMessage: "In this lesson, we'll practice writing professional emails. A good email needs a clear subject, greeting, body, and closing. Let's start!",
            targetSentence: "Dear Mr. Johnson, I am writing to follow up on our meeting last Tuesday.",
          },
          {
            type: "vocabulary",
            aiMessage: "Let's look at formal email vocabulary.",
            words: [
              { word: "Regards", meaning: "A polite way to end a formal email.", example: "Best regards, Sarah" },
              { word: "Inquire", meaning: "To ask for information formally.", example: "I am writing to inquire about the job opening." },
              { word: "Attachment", meaning: "A file sent with an email.", example: "Please find the report in the attachment." },
            ],
          },
          {
            type: "multiple-choice",
            aiMessage: "Which is the most professional way to close an email?",
            question: "Choose the best email closing for a formal business email.",
            options: ["See ya!", "Best regards,", "Later!", "XOXO"],
            answer: "Best regards,",
          },
        ],
      },
    },
  ];

  for (const lesson of seedLessons) {
    const [created] = await db.insert(lessons).values(lesson).returning();

    const vocabStep = (lesson.content as any).steps.find((s: any) => s.type === "vocabulary");
    if (vocabStep?.words) {
      for (const w of vocabStep.words) {
        await db.insert(vocabularyWords).values({
          word: w.word,
          meaning: w.meaning,
          exampleSentence: w.example || "",
          cefrLevel: lesson.cefrLevel,
          lessonId: created.id,
        });
      }
    }
  }

  console.log("Database seeded with lessons and vocabulary.");
}
