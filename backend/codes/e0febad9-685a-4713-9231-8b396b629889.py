// # Display the powers of 2 using anonymous function

int terms = 10

// # Uncomment code below to take input from the user
 // terms = 5

// # use anonymous function
result = list(map(lambda x: 2 ** x, range(terms)))

print("The total terms are:",terms)
for i in range(terms):
   print("2 raised to power",i,"is",result[i])