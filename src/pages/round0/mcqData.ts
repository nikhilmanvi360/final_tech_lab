export const MATH_MCQS = [
  {
    q: "Which of the following is a tautology?",
    options: ["p ∧ ¬p", "p ∨ ¬p", "p → ¬p", "p ↔ ¬p"],
    a: 1,
  },
  {
    q: "The negation of the statement “All students are honest” is:",
    options: [
      "No student is honest",
      "All students are dishonest",
      "Some students are not honest",
      "Some students are honest",
    ],
    a: 2,
  },
  {
    q: "Which rule of inference is applied in the following? If p → q and p are true, then q is true.",
    options: [
      "Modus Tollens",
      "Modus Ponens",
      "Hypothetical Syllogism",
      "Resolution",
    ],
    a: 1,
  },
  {
    q: "Which proof technique is most suitable for proving statements of the form “If p, then q”?",
    options: [
      "Proof by contradiction",
      "Direct proof",
      "Mathematical induction",
      "Counterexample",
    ],
    a: 1,
  },
  {
    q: "If A = {1,2,3} and B = {3,4,5}, then A ∪ B is:",
    options: ["{3}", "{1,2,4,5}", "{1,2,3,4,5}", "{1,2}"],
    a: 2,
  },
  {
    q: "A function f: A → B is called one-to-one if:",
    options: [
      "Every element in B has a pre-image",
      "Distinct elements in A map to distinct elements in B",
      "Every element maps to itself",
      "A = B",
    ],
    a: 1,
  },
  {
    q: "What is the sum of the first 10 natural numbers?",
    options: ["45", "50", "55", "60"],
    a: 2,
  },
  {
    q: "In a matrix, the element located in the 2nd row and 3rd column is represented as:",
    options: ["a23", "a32", "a22", "a13"],
    a: 0,
  },
  {
    q: "How many ways can 3 books be selected from 7 books?",
    options: ["21", "35", "49", "14"],
    a: 1,
  },
  {
    q: "The number of permutations of 5 distinct objects taken all at a time is:",
    options: ["25", "60", "120", "240"],
    a: 2,
  },
  {
    q: "According to the pigeonhole principle, if 11 pigeons are placed into 10 holes, then:",
    options: [
      "Every hole has one pigeon",
      "One hole contains at least two pigeons",
      "Two holes are empty",
      "Every hole contains two pigeons",
    ],
    a: 1,
  },
  {
    q: "The value of 5C2 is:",
    options: ["5", "10", "15", "20"],
    a: 1,
  },
  {
    q: "The coefficient of x² in (1 + x)^5 is:",
    options: ["5", "10", "15", "20"],
    a: 1,
  },
  {
    q: "Which method is commonly used for solving recurrence relations?",
    options: [
      "Binary Search",
      "Substitution Method",
      "Bubble Sort",
      "Linear Search",
    ],
    a: 1,
  },
  {
    q: "Divide and conquer algorithms generally work by:",
    options: [
      "Solving the whole problem directly",
      "Dividing a problem into smaller subproblems",
      "Using randomization only",
      "Ignoring recursion",
    ],
    a: 1,
  },
  {
    q: "The Inclusion-Exclusion principle is mainly used to:",
    options: [
      "Sort elements",
      "Count overlapping sets correctly",
      "Find matrix inverses",
      "Draw graphs",
    ],
    a: 1,
  },
  {
    q: "Mathematical induction consists of:",
    options: [
      "Base step and inductive step",
      "Hypothesis and theorem",
      "Premise and conclusion",
      "Input and output",
    ],
    a: 0,
  },
  {
    q: "Strong induction differs from ordinary induction because:",
    options: [
      "It does not require a base case",
      "It assumes all previous cases are true",
      "It works only for even numbers",
      "It is not a proof technique",
    ],
    a: 1,
  },
  {
    q: "Which of the following is recursive in nature?",
    options: [
      "Factorial calculation",
      "Addition of two numbers",
      "Multiplication table",
      "Matrix transpose",
    ],
    a: 0,
  },
  {
    q: "A relation R on a set A is reflexive if:",
    options: [
      "(a,b) ∈ R implies (b,a) ∈ R",
      "(a,a) ∈ R for every a ∈ A",
      "(a,b) and (b,c) imply (a,c)",
      "No element is related to itself",
    ],
    a: 1,
  },
  {
    q: "A relation R is symmetric if:",
    options: [
      "(a,b) ∈ R implies (b,a) ∈ R",
      "(a,a) ∈ R",
      "(a,b) and (b,c) imply (a,c)",
      "Every element is unique",
    ],
    a: 0,
  },
  {
    q: "Which relation is both symmetric and transitive?",
    options: [
      "Equivalence relation",
      "Partial order relation",
      "Function relation",
      "Empty relation only",
    ],
    a: 0,
  },
  {
    q: "The transitive closure of a relation is used to:",
    options: [
      "Remove all relations",
      "Make a relation transitive",
      "Convert a relation into a function",
      "Count subsets",
    ],
    a: 1,
  },
  {
    q: "A graph consists of:",
    options: [
      "Vertices only",
      "Edges only",
      "Vertices and edges",
      "Paths only",
    ],
    a: 2,
  },
  {
    q: "In graph theory, two vertices connected by an edge are called:",
    options: [
      "Adjacent vertices",
      "Parallel vertices",
      "Isolated vertices",
      "Cyclic vertices",
    ],
    a: 0,
  },
  {
    q: "A connected graph that contains no cycles is called:",
    options: ["Complete graph", "Bipartite graph", "Tree", "Planar graph"],
    a: 2,
  },
  {
    q: "Which path visits every edge exactly once?",
    options: ["Hamilton path", "Euler path", "Simple path", "Cyclic path"],
    a: 1,
  },
  {
    q: "Dijkstra’s algorithm is used to solve:",
    options: [
      "Graph coloring problems",
      "Shortest-path problems",
      "Matrix multiplication",
      "Sorting problems",
    ],
    a: 1,
  },
  {
    q: "A planar graph can be drawn:",
    options: [
      "Without vertices",
      "Without edges",
      "Without crossing edges",
      "Only using cycles",
    ],
    a: 2,
  },
  {
    q: "Which traversal technique uses a queue data structure?",
    options: [
      "Depth First Search",
      "Breadth First Search",
      "Binary Search",
      "Linear Search",
    ],
    a: 1,
  },
];
