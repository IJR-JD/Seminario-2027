/* General Python programming workshops · 17 units × 12 stages.
 * Every activity has an exact output or an explicit multiple-choice answer.
 * Standalone no-input Python snippets keep browser-worker execution deterministic.
 * ?track=statistics keeps the original academic statistics course untouched.
 */
(()=>{"use strict";
if(window.SEMINAR_2027_TRACK!=="programming")return;
const C=(title,prompt,output,hint="Create variables or functions instead of printing the expected answer directly.")=>({title,prompt,output,hint,mode:"code"});
const Q=(title,prompt,choices,answer,hint="Review the definition and mentally trace the given example.")=>({title,prompt,choices,answer,hint,mode:"choice"});
const lessons={
algoritmos:[
 Q("What is an algorithm?","Which description accurately defines an algorithm?",["A finite sequence of unambiguous instructions","A random list of guesses","A particular Python editor"],0),
 Q("Input comes first","What is the usual order of a computational solution?",["Output → Process → Input","Input → Process → Output","Process → Output → Input"],1),
 Q("Identify the data","A program computes rectangle area. Which values are inputs?",["The displayed area","The word FIN","The base and height"],2),
 Q("Identify processing","To calculate the area of a rectangle, which step is processing?",["Multiplying base by height","Reading the input","Displaying the result"],0),
 Q("Trace execution","The steps are x=3; x=x+2; print(x). Which value is displayed?",["3","5","2"],1),
 Q("Finite instructions","What distinguishes a finite algorithm?",["It never stops","It cannot branch","It has a defined terminating path"],2),
 C("Your first output","Write a short Python script that displays exactly Ready.","Ready"),
 C("Compute a rectangle","Store base = 6 and height = 4, calculate their product in another variable, then print the computed area.","24"),
 C("Add two values","Store a = 12 and b = 8 and display the calculated sum.","20"),
 C("Apply an ordered sequence","Start with total = 5. Add 3 to total, multiply the updated value by 2, and print total.","16"),
 C("Find a price total","Set price = 4500 and quantity = 3, compute their product, then print the total.","13500"),
 C("Use a stopping condition","Start n=0 and increase n one at a time until it equals 4. Display n after the loop.","4")
],
flowcharts:[
 Q("Start/End symbol","Which flowchart shape conventionally represents START or END?",["Diamond","Oval/terminator","Parallelogram"],1),
 Q("Decision symbol","Which shape expresses a condition with two outgoing branches?",["Rectangle","Oval","Diamond"],2),
 Q("Input/output symbol","Which shape usually represents reading or printing information?",["Parallelogram","Circle","Diamond"],0),
 Q("Process symbol","Where does the calculation result = a + b belong?",["Terminator","Process rectangle","Decision diamond"],1),
 Q("Arrow meaning","What do arrows show in a conventional flowchart?",["Variable data type","The language interpreter","Direction of execution"],2),
 Q("Branch labeling","A decision diamond checks n > 0. What labels make the routes unambiguous?",["Yes and No","Python and Java","Integer and String"],0),
 C("Translate a decision: minor","Implement the flowchart AGE ≥ 18? for age = 17 using if/else. Print Adult or Minor.","Minor"),
 C("Translate a decision: adult","Use the same decision for age = 21. Print Adult or Minor.","Adult"),
 C("Translate a process block","Implement INPUT a=7,b=5 → PROCESS sum → OUTPUT result with Python. Print only the sum.","12"),
 C("Trace a linear algorithm","Start n=2; multiply n by 4; add 1; print the final value.","9"),
 C("Trace a two-way branch","Set x=-3. If x is negative print Negative, otherwise print Non-negative.","Negative"),
 C("Trace a loop-back arrow","Set count=0. While count is less than 3, increase it. Print the final count.","3")
],
operations:[
 C("Variable addition","Create a=17 and b=8 and print their sum using an expression.","25"),
 C("Operator precedence","Use Python to evaluate 2+3*4 and print the result.","14"),
 C("Exponentiation","Store x=9; print x squared using **.","81"),
 C("Floor division","Use Python floor division to print 7//2.","3"),
 C("Remainder","Use the remainder operator % to print 10%3.","1"),
 C("Parenthesized expression","Print the value of (2+3)*4, using parentheses in your expression.","20"),
 C("True division","Calculate 9/2 in Python and print the result.","4.5"),
 C("Update a variable","Start x=10; use the += operator to add 7; print x.","17"),
 C("Arithmetic order","Print the value of 3**2 + 2*5 using Python operators.","19"),
 C("Combined expression","Compute 24//5 + 24%5 and print the result.","8"),
 Q("Assignment vs equality","Which operator checks whether two values are equal?",["=","==","!="],1),
 Q("Exponent operator","Which expression calculates 2 raised to the power 4?",["2**4","2^4","2//4"],0)
],
variables:[
 C("Integer type","Create value=42 and print type(value).__name__.","int"),
 C("Float type","Create value=4.5 and print the Python type name.","float"),
 C("String type","Create value='10A' and print the Python type name.","str"),
 C("Boolean type","Create flag=True and print its type name.","bool"),
 C("Convert text to number","Set text='12', convert it with int(), add 3, and print the computed result.","15"),
 C("None type","Assign value=None and print type(value).__name__.","NoneType"),
 C("Reassignment","Start x=6; reassign x=x+4; print x.","10"),
 C("Float conversion","Convert the string '7.5' to float and print the result.","7.5"),
 C("Turn a number into text","Assign n=25 and print type(str(n)).__name__.","str"),
 C("Case-sensitive names","Create both value=3 and Value=8, then print their calculated sum.","11"),
 Q("Dynamic typing","Which statement best describes Python variables?",["Each variable name must be permanently int","Names are bound to objects that have types","All numeric values are strings"],1),
 Q("Invalid conversion","What happens when int('hello') is evaluated?",["ValueError is raised","The result is zero","Python returns 'hello'"],0)
],
"input-output":[
 C("Formatted greeting","Store name='Ana' and print Hello, Ana! using an f-string.","Hello, Ana!"),
 C("Simulated user input","Use text='17' as a simulated input, convert it to int, then print the age next year.","18"),
 C("Format a total","Set apples=3 and pears=2. Use an f-string to print Total: 5 with the sum computed.","Total: 5"),
 C("Convert decimal text","Set text='4.5'; convert it to float and print twice the value.","9.0"),
 C("Concatenate labels","Store first='Py' and second='thon', concatenate the variables and print the result.","Python"),
 C("Multiple print lines","Print First on one line and Second on the next using two print calls.","First\nSecond"),
 C("One-line formatting","Set x=5 and y=2 and print x=5, y=2 with an f-string.","x=5, y=2"),
 C("Format with two decimals","Use pi=3.14159 and an f-string with :.2f to display pi=3.14.","pi=3.14"),
 C("Escaped newline","Print the string A followed by a newline and B using a single print call.","A\nB"),
 C("Build a user message","Use name='Luis' and score=90 to print Luis scored 90 using formatting.","Luis scored 90"),
 Q("Type returned by input","Which type is returned by input() in Python?",["int","str","float"],1),
 Q("Non-blocking browser lab","How should a classroom example simulate user input inside this Python worker?",["Call input() and wait indefinitely","Hardcode every answer in print","Use a preset response string and parse it"],2)
],
booleans:[
 C("Greater than","Store x=7 and y=4; print whether x>y.","True"),
 C("Equal comparison","Define a=5 and b=8, compare them using the equality operator == and print the resulting Boolean.","False"),
 C("Not equal","Print whether 10!=9 using Python.","True"),
 C("AND truth","Set age=19 and has_id=True; print age>=18 and has_id.","True"),
 C("OR truth","Set weekend=False and holiday=True; print weekend or holiday.","True"),
 C("NOT truth","Set ready=False and print not ready.","True"),
 C("Both false","Print the Boolean result of (4>9) and (3<5).","False"),
 C("Chained comparison","Store n=8, use a chained comparison to check whether it is strictly between 1 and 10, and print the Boolean.","True"),
 C("Membership condition","Set word='Python' and print whether 'th' is in word.","True"),
 C("De Morgan example","Set a=True and b=False and print not(a and b).","True"),
 Q("AND rule","For Boolean variables a and b, in which circumstances does the expression a and b evaluate to True?",["If a alone is True","If at least one value is True","Only when both are True"],2),
 Q("OR rule","For Boolean variables a and b, in which circumstances does the expression a or b evaluate to False?",["When both are False","When either is True","Only when both are True"],0)
],
conditionals:[
 C("Positive branch","Store n=9 and use if/else to print Positive if n>0, otherwise Non-positive.","Positive"),
 C("Zero branch","Store n=0 and classify it using if/elif/else into Positive, Zero or Negative.","Zero"),
 C("Negative branch","Store n=-7 and classify it into Positive, Zero or Negative using branches.","Negative"),
 C("Even or odd","Store n=14; check n%2 and use if/else to print Even or Odd.","Even"),
 C("Pass threshold","Set score=72 and use if/else with threshold 60 to print Pass or Retry.","Pass"),
 C("Grade bands","Store score=85. Use if/elif/else: A for >=90, B for >=70, C otherwise. Print the resulting letter.","B"),
 C("Age restriction","Set age=16. Print Minor when age<18 and Adult otherwise.","Minor"),
 C("Password check","Set password='code2027'. Compare against the exact text and print Accepted or Rejected.","Accepted"),
 C("Maximum of two","Set x=11 and y=8. Use a conditional to print the larger value.","11"),
 C("Multiple conditions","Set temperature=27. Print Warm for >=25, Mild for >=15 and Cold otherwise.","Warm"),
 Q("elif semantics","When is an elif condition checked?",["Only if all earlier if/elif tests were False","On every execution regardless of if","Only after else"],0),
 Q("Indentation","Which code belongs to the if branch?",["Statements after any blank line","Indented statements immediately under the colon","Every statement in the Python file"],1)
],
"for-loops":[
 C("Count from one","Use for with range(1, 6) to print 1,2,3,4,5 on separate lines.","1\n2\n3\n4\n5"),
 C("Zero to four","Use for with range(5) and print each item on a separate line.","0\n1\n2\n3\n4"),
 C("Accumulate a sum","Use a for loop with range(1, 5), adding values to total, then print total.","10"),
 C("Even numbers","Use range with an explicit step to print 2,4,6,8,10, each on its own line.","2\n4\n6\n8\n10"),
 C("Repeat a message","Use a for loop to print Go exactly three times, on separate lines.","Go\nGo\nGo"),
 C("Count items","Use a for loop to count the elements of ['a','b','c','d'] without len() and print the final count.","4"),
 C("Double values","Use for to iterate [2,4,6] and print each value multiplied by 2, on its own line.","4\n8\n12"),
 C("Skip one number","Use for with range(1,6) and continue to skip 3; print the remaining numbers, one per line.","1\n2\n4\n5"),
 C("Stop early","Use for with range(1,10), break when n reaches 4, print all earlier numbers.","1\n2\n3"),
 C("Multiply a product","Start product=1; for n in range(1,5), multiply product by n; print product.","24"),
 Q("range stop","Which sequence does range(1,4) produce?",["1,2,3,4","1,2,3","0,1,2,3"],1),
 Q("continue behavior","What does continue do inside a for loop?",["Skips to the next iteration","Exits the entire program","Creates a new loop"],0)
],
"while-loops":[
 C("Counter loop","Start n=0. Use while n<3 to increase n, then print the final value.","3"),
 C("Print countdown","Start n=3. Use a while loop to print 3,2,1 on separate lines.","3\n2\n1"),
 C("Accumulate to ten","Start total=0 and n=1. Use while n<=4 to add n to total, then print total.","10"),
 C("Stop with break","Start n=0. Use while True: increase n, break as soon as n>=3. Print n.","3"),
 C("Execute at least once","Start n=5. Simulate do...while using while True; print n once, then break if n>=5.","5"),
 C("Test before entry","Start n=5 and count=0. Use while n<5 to increment count. Print count after the loop.","0"),
 C("Update a power","Start x=1 and count=0. Use while count<4 to multiply x by 2, then print x.","16"),
 C("Skip a state safely","Start n=0. While n<5, increment n, continue on n==3, and print the other values.","1\n2\n4\n5"),
 C("Find first multiple","Start n=0. Use while True, increasing n until it is divisible by both 3 and 4. Print n.","12"),
 C("Digit counter","Start value=1234 and digits=0. Use while value>0 with //10 to count its digits. Print digits.","4"),
 Q("Native do...while","Which statement about Python is correct?",["Python uses do...while with braces","Python has no native do...while; while True / break can emulate it","Python's for loop is called do...while"],1),
 Q("Infinite loop risk","What most often prevents a while condition from ever becoming False?",["Missing a state update","Using print()","Adding a comment"],0)
],
"nested-loops":[
 C("Count a grid","Use a nested for: 2 outer iterations and 3 inner iterations, increment count in the inner body, then print count.","6"),
 C("Pairs of coordinates","Use nested for loops for rows 1..2 and columns 1..2, printing r,c with no spaces and one pair per line.","1,1\n1,2\n2,1\n2,2"),
 C("Solid square","Use a loop to print *** on three separate lines. Construct each line from '*' * 3.","***\n***\n***"),
 C("Triangle shape","Use for row in range(1,4) and print '*'*row to form a left-aligned triangle.","*\n**\n***"),
 C("Multiplication pairs","Use nested loops to print products of i=1,2 and j=1,2, one per line in row-major order.","1\n2\n2\n4"),
 C("Matrix coordinates","Use nested loops over 2 rows and 3 columns to print row-column pairs joined with '-' starting at zero.","0-0\n0-1\n0-2\n1-0\n1-1\n1-2"),
 C("Counting even pairs","Use nested loops i=1..3,j=1..3 and count pairs where (i+j)%2==0. Print the count.","5"),
 C("Grid height and width","Store rows=3 and cols=4, use nested loops to count all cells and print count.","12"),
 C("Table of two","Use nested loops to print 2,4,6 on one line and 3,6,9 on the next (numbers separated by single spaces).","2 4 6\n3 6 9"),
 C("Nested while loops","Use nested while loops with outer i from 0 to 1 and inner j from 0 to 1; count inner executions and print count.","4"),
 Q("Body executions","How many times does the inner body execute for 3 outer and 4 inner repetitions?",["7","12","34"],1),
 Q("Loop scope","Where must the inner counter be reset in a nested while loop?",["Before the entire program","After the last outer iteration","At the beginning of each outer iteration"],2)
],
functions:[
 C("Define add","Define add(a,b) returning their sum; call it with 4 and 6 and print the returned value.","10"),
 C("Square function","Define square(x) returning x**2. Print square(3) and square(5), one per line.","9\n25"),
 C("Default parameter","Define greet(name='World') returning 'Hi ' + name; call with no argument and print.","Hi World"),
 C("Check evenness","Define is_even(n) returning a Boolean using %, and print is_even(8).","True"),
 C("Calculate a rectangle","Define area(base,height) returning base*height; call with 7 and 3 and print.","21"),
 C("Return versus print","Define double(n) that returns 2*n. Assign double(6) to value and print value+1.","13"),
 C("Local scope","Define fn(x) that assigns result=x+4 and returns result. Call fn(6) and print result returned.","10"),
 C("Multiple returns","Define min_max(values) returning a tuple containing minimum and maximum. Print min_max([8,3,10]).","(3, 10)"),
 C("Use a helper","Define add(a,b) and triple(x) using add(x,add(x,x)); print triple(4).","12"),
 C("Count characters","Define size(text) returning len(text); call with 'Python' and print the result.","6"),
 Q("return keyword","What does return do in a function?",["Print a line automatically","Send a value to the caller","Import the function"],1),
 Q("Local variable","Which statement is correct about a variable created inside a function?",["It is typically local to that function","It automatically overwrites all globals","It always becomes a module constant"],0)
],
arrays:[
 C("Zero-based indexing","Create [6,10,15,21] and print the third value using its index.","15"),
 C("List length","Create [5,10,15,20] and print the list length using len().","4"),
 C("Append a value","Create [6,12], append 18, and print the full list.","[6, 12, 18]"),
 C("Negative indexing","Create [3,6,9,12] and print the last element using a negative index.","12"),
 C("Slice elements","Create [3,6,9,12] and print the slice from index 1 through index 2 inclusive.","[6, 9]"),
 C("Replace an item","Create [5,10,15], replace the second item with 20, print the list.","[5, 20, 15]"),
 C("List membership","Create values=[2,4,6,8]; print whether 6 is in values.","True"),
 C("Iterate over a list","Use for on [2,4,6] to print each value squared on its own line.","4\n16\n36"),
 C("List comprehension","Use a list comprehension to create squares of 1,2,3,4; print the new list.","[1, 4, 9, 16]"),
 C("Remove a value","Create [4,6,8,6], remove the first occurrence of 6, then print the updated list.","[4, 8, 6]"),
 Q("append() behavior","What value does values.append(9) itself return?",["The updated list","None","9"],1),
 Q("Index convention","What is the index of the first element in a Python list?",["0","1","-2"],0)
],
strings:[
 C("Uppercase","Store text='python'; print text.upper().","PYTHON"),
 C("Remove whitespace","Store text='  hello  '; print text.strip().","hello"),
 C("First character","Store word='Python'; print the first character using an index.","P"),
 C("Last character","Store word='Python'; print the last character using a negative index.","n"),
 C("Substring","Store word='Programming'; print word[0:7].","Program"),
 C("Replace letters","Store word='banana'; replace all 'a' with 'o' and print the returned string.","bonono"),
 C("Split a CSV-like line","Store line='red,green,blue'; split on commas and print the resulting list.","['red', 'green', 'blue']"),
 C("Join tokens","Use '-'.join(...) on ['a','b','c'] and print.","a-b-c"),
 C("Count substring","Store word='banana'; print word.count('a').","3"),
 C("Check start","Store filename='report.txt'; print filename.endswith('.txt').","True"),
 Q("String mutation","Which statement about strings is correct?",["text[0]='A' edits in place","Strings are mutable lists","Strings are immutable; methods return new strings"],2),
 Q("Split result","What does 'a,b'.split(',') return?",["A list of two strings","One integer","A dictionary"],0)
],
dictionaries:[
 C("Dictionary lookup","Create person={'name':'Ana','age':16}; print the value for 'name'.","Ana"),
 C("Update a mapping","Create person={'score':5}; update score to 8 and print it.","8"),
 C("Safe get","Create person={'name':'Ana'}. Use get('age','unknown') and print the result.","unknown"),
 C("Count keys","Create {'a':1,'b':2,'c':3}, then print len() of the dictionary.","3"),
 C("Check membership","Create {'name':'Ana'} and print whether 'name' is in the dictionary.","True"),
 C("Tuple values","Create point=(3,4) and print point[1].","4"),
 C("Set cardinality","Create a set from [1,2,2,3] and print its length.","3"),
 C("Set union count","Create sets a={1,2}, b={2,3}; print len(a|b).","3"),
 C("Dictionary values","Create scores={'Ana':5,'Luis':3}; print sum(scores.values()).","8"),
 C("Loop dictionary keys","Create data={'a':1,'b':2}; iterate over sorted(data) and print each key and value separated by ':'.","a:1\nb:2"),
 Q("Dictionary keys","What does a dictionary use for lookups?",["Only sequential indices","Keys","Always floating-point positions"],1),
 Q("Set duplicates","How many distinct values are in set([1,1,2,3])?",["4","2","3"],2)
],
modularity:[
 C("Import math","Import math and print math.sqrt(81).","9.0"),
 C("Use math.pi","Import math and print round(math.pi,2).","3.14"),
 C("Calculate factorial","Import math and print math.factorial(5).","120"),
 C("Selective import","Use from math import ceil and print ceil(4.2).","5"),
 C("The pathlib module","Import Path from pathlib and print Path('report.txt').suffix.",".txt"),
 C("Path stem","Use pathlib.Path('notes.md').stem to print the filename without its extension.","notes"),
 C("Use math.gcd","Import math and print math.gcd(18,24).","6"),
 C("Pure function module","Use the built-in math module to print math.isqrt(20).","4"),
 C("String module","Import string and print string.ascii_lowercase[:5].","abcde"),
 C("Deterministic random","Import random, create rng=random.Random(7), print whether rng.randint(1,10) is between 1 and 10 inclusive.","True"),
 Q("Import namespace","What does import math let you call?",["math.sqrt(16)","sqrt16 without names","Every third-party module automatically"],0),
 Q("Standard library","Which module is part of Python's standard library?",["pygame","numpy","pathlib"],2)
],
debugging:[
 C("Catch invalid integer","Set text='abc'; use try/except ValueError around int(text) and print invalid number if conversion fails.","invalid number"),
 C("Catch index error","Create items=[1,2]. Try items[5]; catch IndexError and print bad index.","bad index"),
 C("Check division by zero","Set x=8 and y=0. Use try/except ZeroDivisionError and print zero denominator.","zero denominator"),
 C("Guard a negative value","Set n=-1; if n<0 print negative input, otherwise print valid.","negative input"),
 C("Simple assertion","Set total=3; assert total>0 and then print valid.","valid"),
 C("Fix a type mismatch","Set text='5'. Convert it to int, add 2, and print the result.","7"),
 C("Fix a missing key","Create data={'name':'Ana'}; use get('score',0) and print the value.","0"),
 C("Handle malformed decimal","Set text='wrong'; catch ValueError while calling float(text) and print parse failed.","parse failed"),
 C("Debug a running total","Use a loop to add [2,3,4] to total initialized at zero, then print total.","9"),
 C("Check a boundary","Set n=0 and test if n>=0; print accepted or rejected according to the condition.","accepted"),
 Q("Error type","Which error is raised by int('not-a-number')?",["IndexError","ValueError","SyntaxError"],1),
 Q("Exception practice","What is the better exception-handling strategy?",["Catch specific expected exceptions","Use except: pass everywhere","Ignore errors"],0)
],
project:[
 C("Build a reusable total","Define total(values) returning sum(values); call it with [4,6,10], print the result.","20"),
 C("Use a shopping cart","Define subtotal(prices) returning their sum. Call with [2500,3500] and print the result.","6000"),
 C("Simple validation","Define is_valid(age) returning True when 0<=age<=120. Print is_valid(16).","True"),
 C("Apply a discount","Define discount(price,pct) returning price*(1-pct/100). Call with 100 and 20, print result.","80.0"),
 C("Create a mini menu","Use a dictionary {'1':'Start','2':'Help','3':'Exit'} and print menu['2'].","Help"),
 C("Report three statuses","Write a classify(score) function returning 'Pass' for >=60, else 'Retry'. Print classify(70), classify(55), classify(90), one per line.","Pass\nRetry\nPass"),
 C("Analyze a player's lives","Define remaining(start,lost) returning max(0,start-lost). Print remaining(3,2).","1"),
 C("Create a character counter","Define count_letters(text) returning len(text.replace(' ','')), call with 'hello world', print the result.","10"),
 C("Inventory lookup","Use stock={'pen':5,'book':2}, implement a get with default 0, and print stock for 'pencil'.","0"),
 C("Test normal and edge cases","Define safe_average(values) returning 0 when list is empty, otherwise sum/len. Print safe_average([4,6]) and safe_average([]), one per line.","5.0\n0"),
 Q("Project decomposition","Which is the most maintainable project structure?",["Put every task into one untested expression","Separate input, processing, output and tests into functions","Hardcode all final answers as print statements"],1),
 Q("Edge cases","Which example is an edge case for averaging a list?",["A populated list of three numbers","Two different valid averages","An empty list"],2)
]
};
const outputKeys={},choiceKeys={},validModes=new Set(["code","choice"]);
const course=window.SEMINAR_2027_COURSE||[];
let generated=0;
for(const topic of course){
 const tasks=lessons[topic.slug];
 if(!tasks||tasks.length!==12)throw Error("Programming exercises missing "+topic.slug+" ("+(tasks?.length??0)+")");
 topic.exercises=tasks.map((source,i)=>{
  if(!validModes.has(source.mode))throw Error("Invalid stage mode "+topic.slug);
  const key="prog-"+topic.slug+"-"+String(i+1).padStart(2,"0");
  const task={key,title:source.title,prompt:source.prompt,mode:source.mode,hint:source.hint};
  if(source.mode==="choice"){
   if(!Number.isInteger(source.answer)||!source.choices?.[source.answer])throw Error("Broken choice "+key);
   task.choices=source.choices;
   choiceKeys[key]=source.answer;
  }else{
   if(typeof source.output!=="string"||!source.output.length)throw Error("Missing output "+key);
   outputKeys[key]=source.output;
  }
  generated++;
  return Object.freeze(task);
 });
 Object.freeze(topic.exercises);Object.freeze(topic);
}
if(generated!==204||Object.keys(lessons).length!==course.length)throw Error("Expected 204 verified programming stages");
window.IJR_2027_CHECKS=Object.freeze({choices:Object.freeze(choiceKeys),outputs:Object.freeze(outputKeys)});
window.SEMINAR_2027_COURSE=Object.freeze(course);
window.SEMINAR_2027_TOPIC_MAP=Object.freeze(Object.fromEntries(course.map(t=>[t.slug,t])));
window.IJR_2027_PROGRAMMING_COUNTS=Object.freeze({topics:course.length,stages:generated,code:Object.keys(outputKeys).length,choices:Object.keys(choiceKeys).length});
})();