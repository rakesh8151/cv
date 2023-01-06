/**
 * Testing async code
 */

function fetchData(callback) {
    setTimeout(() => {
        callback("Rakesh")
    }, 2000);
}

/*
test("testing the callback function", () => {
    function callback(data) {
        expect(data).toBe("Rakesh");
    }
    fetchData(callback);
});
*/
test("testing the callback function", (done) => {
    try {
        function callback(data) {
            expect(data).toBe("Rakesh");
            done(); //unless untill this line is called.. test will wait
        }
    } catch (err) {
        done(err);
    }
    fetchData(callback);
});

/**
 * 1.fetchData expects a call back function
 * 2.callback function should have 1 arguements
 * 3. if we execute this function by passing callback fn
 * after 2 seconds , call back function will be called with
 * the arguments Rakesh
 */