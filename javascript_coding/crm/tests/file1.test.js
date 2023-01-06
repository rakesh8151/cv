/**
 * write any test
 */

test('First test block', () => {
    //write the logic to be tested
    console.log("hello students");
});

function add(a, b) {
    return a + b;
}

test("Testing the output of add ", () => {
    //Expectation,actuals
    expect(add(3, 4)).toBe(7);
});

test("testing two objects", () => {
    const obj = {
        name: "Rakesh",
        age: 21
    }

    expect(obj).toEqual({
        name: "Rakesh",
        age: 21
    });
});

test("Testing the null ", () => {
    let n = null;
    let a = undefined;
    let b = 7;

    expect(n).toBeNull();
    expect(a).toBeUndefined();
    expect(b).toBeDefined();
    /**
     * toBeGreaterThan
     * toBeGreaterThanOrEqual
     * toBeLessThan
     * toBeLessThanOrEqual
     */
});