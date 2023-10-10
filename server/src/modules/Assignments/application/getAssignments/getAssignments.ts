class getAssignments (){
    constructor(repository){
        this.repository = repository;
    }

    obtainAssignments(){
        return repository.obtainAssignments();
    }
}