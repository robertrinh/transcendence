BOOSTURL := https://archives.boost.io/release/1.89.0/source/boost_1_89_0.tar.bz2
BOOST := boost_1_89_0

.PHONY: all

$(BOOST):
	wget $(BOOSTURL) 
	tar --bzip2 -xf ./$(BOOST).tar.bz2
	rm -rf $(BOOST).tar.bz2

all: $(BOOST)
