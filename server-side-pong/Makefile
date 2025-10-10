CC := c++
BOOSTURL := https://archives.boost.io/release/1.89.0/source/boost_1_89_0.tar.bz2
BOOST := boost_1_89_0
INC_DIRS := include $(BOOST)
INC := $(foreach dir, $(INC_DIRS), -I$(dir))
CFLAGS := -Wall -Wextra -Werror $(INC) -g -std=c++11
LDFLAGS :=
SRCDIR := src
OBJDIR := build
SOURCES := $(wildcard src/*.cpp)
OBJECTS := $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)
NAME := matchmakingserver

.PHONY: all

all: $(NAME)

$(BOOST):
	wget $(BOOSTURL) 
	tar --bzip2 -xf ./$(BOOST).tar.bz2
	rm -rf $(BOOST).tar.bz2

$(OBJDIR)/%.o: $(SRCDIR)/%.cpp | $(OBJDIR)
	$(CC) $(CFLAGS) -c -o $@ $<

$(NAME): $(OBJECTS)
	$(CC) $(OBJECTS) -o $(NAME)

$(OBJDIR):
	mkdir $(OBJDIR)

clean:
	rm -rf $(OBJECTS)

fclean: clean
	rm -rf $(NAME)

re: fclean all

