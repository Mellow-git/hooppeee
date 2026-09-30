.PHONY: up down seed test check validate e2e demo doctor

up down seed test check validate e2e demo doctor:
	python -m attrib.tasks $@
