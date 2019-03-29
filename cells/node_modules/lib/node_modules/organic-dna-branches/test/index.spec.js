var DNA = require("organic").DNA
var branches = require("../index")

describe("DNA", function(){
  var dna

  beforeEach(function(){
    dna = new DNA()
  })

  it("should create branch using namespace path", function(){
    branches.createBranch(dna, "test.node");
    expect(dna.test).toBeDefined();
    expect(dna.test.node).toBeDefined();
  });

  it("should create branch using namespace path and give it value", function(){
    branches.createBranch(dna, "test.node2", {
      node: "value"
    });
    expect(dna.test).toBeDefined();
    expect(dna.test.node2).toBeDefined();
    expect(dna.test.node2.node).toBe("value");
  });

  it("should select branch using namespace path", function(){
    dna = new DNA({"test": {"node2": {"node":"value"}}})
    var branch = branches.selectBranch(dna, "test.node2");
    expect(branch).toBeDefined();
    expect(branch.node).toBe("value");
  });
})