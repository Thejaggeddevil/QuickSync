pragma circom 2.1.6;

template BatchValidator() {
	signal input oldRoot;
	signal input newRoot;
	signal input batchHash;

	// Constraint: newRoot = oldRoot + batchHash (mod field)
	newRoot === oldRoot + batchHash;
}

component main = BatchValidator();


