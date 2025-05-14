export const codeTemplates = {
  js: `// JavaScript Template
console.log('Hello World!');

function add(a, b) {
  return a + b;
}

// Example usage
const result = add(5, 3);
console.log(result);`,

  py: `# Python Template
def main():
    print("Hello World!")
    
    def add(a, b):
        return a + b
    
    # Example usage
    result = add(5, 3)
    print(result)

if __name__ == "__main__":
    main()`,

  java: `// Java Template
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
    
    public static int add(int a, int b) {
        return a + b;
    }
}`,

  cpp: `// C++ Template
#include <iostream>

int main() {
    std::cout << "Hello World!" << std::endl;
    return 0;
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`
};

export const getTemplateForFile = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  return codeTemplates[extension] || '// Start typing...';
};