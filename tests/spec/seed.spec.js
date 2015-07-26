describe('seed', function() {

    it('should have a version', function() {
        expect(S).have.property('version');
    });

    describe('config', function() {

        before(function() {
            // runs before all tests in this block
        });

        after(function() {
            // runs after all tests in this block
        });

        it('should has some configs', function() {
            expect(S.config('debug')).not.to.be(undefined);
        });

        it('should set/get a config', function() {
            S.config('k', 'v');
            expect(S.config('k')).to.eql('v');
        });

        it('should set a object config', function() {
            S.config({
                k1: 'v1',
                k2: 'v2'
            });
            expect(S.config('k1')).to.eql('v1');
            expect(S.config('k2')).to.eql('v2');
        });

    });
});