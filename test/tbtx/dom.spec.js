describe('dom', function() {
    var S = tbtx;
    describe("singleton instance", function() {
        S.getDocument();
        S.getWindow();
        S.getHead();
        S.getBody();
    });

    describe("width, height, x, y", function() {
        S.$(function() {
            S.pageHeight();
            S.pageWidth();
            S.viewportHeight();
            S.viewportWidth();
            S.scrollY();
            S.scrollX();

            S.fullViewport(".demo");
            S.fullPage(".demo");
            S.stopBodyScroll();
            S.resetBodyScroll();

            S.isInDocument(document.body);

            S.isInView("#demo");
            S.scrollTo("body");

            S.limitLength("p");
            S.flash("body");

            S.flyToTop("body");

            S.initWangWang();
        });
    });
});