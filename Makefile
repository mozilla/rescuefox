submodule:
	@@git submodule init
	@@git submodule update
	@@git submodule foreach --recursive 'git submodule init && git submodule update'
