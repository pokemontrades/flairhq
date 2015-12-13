# Adding a new search function (client side)

Assuming you have done everything client, side, because that is simple, there are a few small things that are not
obvious with the client side code.

Firstly, you need to add a new directory (obvious) and have a form.ejs and result.ejs files. These are for the
advanced form (for the advanced page) and the results, for both the advanced page and the dropdown from the header.

Then you need to add an option to the ./header.ejs file pointing to the right result.ejs file. The reason this can't be
automated, is that we can't loop over the directories in ejs, unless we have an array somewhere of what ones we have, and
that feels messier than this. Maybe. I don't know, we can probably create one sometime or figure out a nicer way to do it.

I'm sure there is a nice way somewhere...