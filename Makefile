PATH := node_modules/.bin:$(PATH)

all: lint test clean build

lint: node_modules
	tslint -p .

test: node_modules
	# jest

clean:
	rm -rf dist

build: node_modules
	tsc

release: all
	git add dist
	standard-version -a

node_modules: package.json
	yarn && touch $@

.PHONY: all lint test clean build release
