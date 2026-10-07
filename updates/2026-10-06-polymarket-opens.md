---
title: Polymarket opens with seventeen names, and six new sources join the board
date: 2026-10-06
summary: Six days out, Polymarket finally listed an economics market, with seventeen names and more money on day one than Kalshi has seen all season. Kalshi sold Ariel Pakes down from 32 to 26 and bought Susan Athey up to 20. And the board now reads six more sources, from a statistical model of the committee to ten AI models to three economists who publish their picks, every one of them to be scored against Monday's result.
observations:
  # Kalshi, Oct 6 close of US day. Last trade; bid, ask and open interest in the note.
  - source: kalshi
    candidate: ariel-pakes
    kind: prob
    value: 0.26
    note: last trade 26 cents on Oct 6, 19:45Z; sold hard in the US morning, a 200-contract sale at 35, 136 at 30 and 50 at 24, then bought back to 35 in the afternoon; resting bid 17, ask 23; open interest 2,387, now second on the board
  - source: kalshi
    candidate: susan-athey
    kind: prob
    value: 0.20
    note: last trade 20 cents on Oct 6, 20:16Z; 58 trades in a day, the busiest name on the book, bought from 19 to 26 and sold back to 20 on 150- and 80-contract hits; resting bid 18, ask 21; open interest 2,725, now the largest on the board
  - source: kalshi
    candidate: richard-blundell
    kind: prob
    value: 0.15
    note: last trade 15 cents on Oct 6, 18:23Z, on 64 contracts bought at 14 and 15; resting bid 9, ask 14; open interest 81, so the price is a thin print
  - source: kalshi
    candidate: robert-barro
    kind: prob
    value: 0.12
    note: last trade 12 cents on Oct 6, 19:36Z; a 200-contract buy at 12 in the morning and a 34-contract print at 18 in the afternoon, then sold back to 12; resting bid 4, ask 9; open interest 349
  - source: kalshi
    candidate: ernst-fehr
    kind: prob
    value: 0.06
    note: no trades; resting bid 6, ask 11; open interest 3
  - source: kalshi
    candidate: partha-dasgupta
    kind: prob
    value: 0.06
    note: no trades; resting bid 8, ask 12, so the bid now sits above the last print; open interest 221
  - source: kalshi
    candidate: matthew-rabin
    kind: prob
    value: 0.05
    note: a single 200-contract sale at 5 on Oct 6, 15:21Z; resting bid 3, ask 7; open interest 203
  - source: kalshi
    candidate: luigi-zingales
    kind: prob
    value: 0.03
    note: last trade 3 cents on Oct 6, 22:08Z, but about 1,400 contracts were bought at 4 and 5 cents through the day, including two 500-lots; open interest 2,152, third on the board; resting bid 2, ask 5
  - source: kalshi
    candidate: andreu-mas-colell
    kind: prob
    value: 0.01
    note: the 500-contract buy at 6 on Oct 5 was followed by a 200-contract sale at 1 on Oct 6, 15:55Z; resting bid 0, ask 8; open interest 706
  # Polymarket, market created Oct 6, 09:04Z. Displayed price = book midpoint.
  - source: polymarket
    candidate: ariel-pakes
    kind: prob
    value: 0.22
    note: opening day; bid 21, ask 23, last trade 23; $6,061 traded, the most on the market
  - source: polymarket
    candidate: susan-athey
    kind: prob
    value: 0.185
    note: opening day; bid 18, ask 19, last trade 18; $4,393 traded
  - source: polymarket
    candidate: robert-barro
    kind: prob
    value: 0.10
    note: opening day; bid 9, ask 11, last trade 9; $1,982 traded
  - source: polymarket
    candidate: partha-dasgupta
    kind: prob
    value: 0.099
    note: opening day; bid 9.2, ask 10.6, last trade 8.6; $4,196 traded, second-most on the market
  - source: polymarket
    candidate: victor-chernozhukov
    kind: prob
    value: 0.095
    note: opening day; bid 7, ask 12, last trade 10; $80 traded, a wide book on almost nothing
  - source: polymarket
    candidate: richard-blundell
    kind: prob
    value: 0.092
    note: opening day; bid 8, ask 10.5, last trade 11.2; $763 traded
  - source: polymarket
    candidate: michael-woodford
    kind: prob
    value: 0.08
    note: opening day; bid 5, ask 11, last trade 8; $228 traded
  - source: polymarket
    candidate: andreu-mas-colell
    kind: prob
    value: 0.079
    note: opening day; bid 7.1, ask 8.6, last trade 6; $633 traded
  - source: polymarket
    candidate: matthew-rabin
    kind: prob
    value: 0.075
    note: opening day; bid 6, ask 9, last trade 8; $1,300 traded
  - source: polymarket
    candidate: lawrence-katz
    kind: prob
    value: 0.075
    note: opening day; bid 7, ask 8, last trade 7; $2,244 traded
  - source: polymarket
    candidate: ernst-fehr
    kind: prob
    value: 0.075
    note: opening day; bid 7.1, ask 7.9, last trade 7.1; $1,001 traded
  - source: polymarket
    candidate: demian-reidel
    kind: prob
    value: 0.07
    note: opening day; bid 6, ask 8, last trade 6; $1,237 traded
  - source: polymarket
    candidate: hal-varian
    kind: prob
    value: 0.065
    note: opening day; bid 6, ask 7, last trade 5; $858 traded
  - source: polymarket
    candidate: david-autor
    kind: prob
    value: 0.065
    note: opening day; bid 5, ask 8, last trade 5; $521 traded
  - source: polymarket
    candidate: luigi-zingales
    kind: prob
    value: 0.055
    note: opening day; bid 4, ask 7, last trade 4; $3,882 traded, third-most on the market
  - source: polymarket
    candidate: sidney-winter
    kind: prob
    value: 0.045
    note: opening day; bid 3, ask 6, last trade 8; $190 traded
  - source: polymarket
    candidate: javier-milei
    kind: prob
    value: 0.029
    note: opening day; bid 2.1, ask 3.8, last trade 3.5; $3,372 traded, more than on Blundell
  # Prophet Arena, AI consensus of 10 models, read Oct 6
  - source: prophet-arena
    candidate: susan-athey
    kind: prob
    value: 0.377
    note: consensus of 10 models; individual models ran from 20 to 47 percent
  - source: prophet-arena
    candidate: ariel-pakes
    kind: prob
    value: 0.206
    note: consensus of 10 models; individual models ran from 13 to 24 percent
  - source: prophet-arena
    candidate: partha-dasgupta
    kind: prob
    value: 0.073
    note: consensus of 10 models
  - source: prophet-arena
    candidate: richard-blundell
    kind: prob
    value: 0.066
    note: consensus of 10 models
  - source: prophet-arena
    candidate: robert-barro
    kind: prob
    value: 0.056
    note: consensus of 10 models
  - source: prophet-arena
    candidate: ernst-fehr
    kind: prob
    value: 0.044
    note: consensus of 10 models
  - source: prophet-arena
    candidate: andreu-mas-colell
    kind: prob
    value: 0.038
    note: consensus of 10 models
  - source: prophet-arena
    candidate: matthew-rabin
    kind: prob
    value: 0.037
    note: consensus of 10 models
  - source: prophet-arena
    candidate: luigi-zingales
    kind: prob
    value: 0.022
    note: consensus of 10 models
  # Octagon AI, last updated July 28
  - source: octagon
    candidate: ariel-pakes
    kind: prob
    value: 0.075
    note: model probability as of July 28
  - source: octagon
    candidate: partha-dasgupta
    kind: prob
    value: 0.063
    note: model probability as of July 28
  - source: octagon
    candidate: luigi-zingales
    kind: prob
    value: 0.031
    note: model probability as of July 28
  - source: octagon
    candidate: susan-athey
    kind: prob
    value: 0.01
    note: model probability as of July 28
  - source: octagon
    candidate: robert-barro
    kind: prob
    value: 0.005
    note: model probability as of July 28
  - source: octagon
    candidate: richard-blundell
    kind: prob
    value: 0
    note: the model gives him zero
  - source: octagon
    candidate: ernst-fehr
    kind: prob
    value: 0
    note: the model gives him zero
  - source: octagon
    candidate: matthew-rabin
    kind: prob
    value: 0
    note: the model gives him zero
  - source: octagon
    candidate: andreu-mas-colell
    kind: prob
    value: 0
    note: the model gives him zero
  # Richard Tol's model, top ten, Sept 20
  - source: tol
    candidate: sanford-grossman
    kind: rank
    value: 1
    of: 10
    note: 4.4 percent, information economics, could share with Matthew Jackson
  - source: tol
    candidate: barry-eichengreen
    kind: rank
    value: 2
    of: 10
    note: trade, with Rogoff; outside the favoured fields, carried by citations and connections
  - source: tol
    candidate: robert-barro
    kind: rank
    value: 3
    of: 10
    note: growth
  - source: tol
    candidate: drew-fudenberg
    kind: rank
    value: 4
    of: 10
    note: game theory, with Rubinstein, Dewatripont or Dixit
  - source: tol
    candidate: gene-grossman
    kind: rank
    value: 5
    of: 10
    note: trade, with Helpman and Melitz; outside the favoured fields
  - source: tol
    candidate: tim-besley
    kind: rank
    value: 6
    of: 10
    note: development, with Persson and Tabellini; Tol notes Persson's closeness to the committee may rule it out
  - source: tol
    candidate: david-weil
    kind: rank
    value: 7
    of: 10
    note: growth
  - source: tol
    candidate: kevin-murphy
    kind: rank
    value: 8
    of: 10
    note: with Blau and maybe Oswald; outside the favoured fields
  - source: tol
    candidate: kenneth-french
    kind: rank
    value: 9
    of: 10
    note: with Vishny and Campbell; outside the favoured fields
  - source: tol
    candidate: gilles-saint-paul
    kind: rank
    value: 10
    of: 10
    note: 2.1 percent, growth
  # Scott Cunningham, Sept 28 list, as reported by Richard Tol (the post is paywalled)
  - source: cunningham
    candidate: david-autor
    kind: rank
    value: 1
    of: 2
    note: first pick with Katz, for skill-biased technological change; as reported by Tol on Sept 28
  - source: cunningham
    candidate: lawrence-katz
    kind: rank
    value: 1
    of: 2
    note: first pick with Autor; as reported by Tol on Sept 28
  - source: cunningham
    candidate: kevin-murphy
    kind: rank
    value: 2
    of: 2
    note: a possible third name on the Autor-Katz prize, which we score as the second tier; as reported by Tol
  - source: cunningham
    candidate: steven-berry
    kind: rank
    value: 2
    of: 2
    note: the backup pick, with Levinsohn and Pakes; as reported by Tol
  - source: cunningham
    candidate: james-levinsohn
    kind: rank
    value: 2
    of: 2
    note: the backup pick, with Berry and Pakes; as reported by Tol
  - source: cunningham
    candidate: ariel-pakes
    kind: rank
    value: 2
    of: 2
    note: the backup pick, with Berry and Levinsohn; as reported by Tol
  # Nicholas Decker, Oct 4
  - source: decker
    candidate: steven-berry
    kind: named
    value: 1
    note: 'Oct 4, on X: "Confident enough in Bresnahan-Berry-Pakes that I think I''m going to write the article in advance"'
  - source: decker
    candidate: timothy-bresnahan
    kind: named
    value: 1
    note: Oct 4
  - source: decker
    candidate: ariel-pakes
    kind: named
    value: 1
    note: Oct 4; his 2025 three was Berry, Hausman and Pakes
  # Maia Mindel, X thread, secondhand
  - source: mindel
    candidate: steven-berry
    kind: named
    value: 1
    note: secondhand, from a roundup of economists' threads
  - source: mindel
    candidate: timothy-bresnahan
    kind: named
    value: 1
    note: secondhand
  - source: mindel
    candidate: james-levinsohn
    kind: named
    value: 1
    note: secondhand
  - source: mindel
    candidate: ariel-pakes
    kind: named
    value: 1
    note: secondhand
---
Six days before the announcement, three things happened on the same day. Polymarket opened. Kalshi changed its mind about [Ariel Pakes](/candidates/ariel-pakes/). And this desk added six sources to the board, because every one of them will be graded on Monday, and the grades are how next year's weights get set.

**Polymarket opens.** [Polymarket](https://polymarket.com/event/nobel-economics-prize-winner-2026) listed its economics market at 09:04 UTC on Monday, October 6, with seventeen names, eight more than Kalshi has carried since July. By the end of the US day it had traded about $33,000 and was holding $43,000 of liquidity, which is more money than this prize has seen on any market this season. The top of the book agrees with Kalshi on the order and disagrees on the size: Pakes at 22, [Susan Athey](/candidates/susan-athey/) at 18.5, [Robert Barro](/candidates/robert-barro/) and [Partha Dasgupta](/candidates/partha-dasgupta/) at 10. Then come the names Kalshi never listed. [Victor Chernozhukov](/candidates/victor-chernozhukov/) is 9.5 on eighty dollars of trade, so a wide book on a rumor. [Michael Woodford](/candidates/michael-woodford/) is 8, [Lawrence Katz](/candidates/lawrence-katz/) is 7.5 on $2,244 of real money, [Hal Varian](/candidates/hal-varian/) and [David Autor](/candidates/david-autor/) are 6.5, [Sidney Winter](/candidates/sidney-winter/) is 4.5. That is the first time anyone has put a price on three of this year's four Clarivate names. And then two Argentines: [Demian Reidel](/candidates/demian-reidel/), the president's former chief economic adviser, at 7, and [Javier Milei](/candidates/javier-milei/) himself at 3, on $3,400 of volume, more than traded on [Richard Blundell](/candidates/richard-blundell/). A prediction market will list anyone a crowd wants to bet on. We have added both to the board, with scouting reports that say what the market line means.

**Kalshi sells Pakes and buys Athey.** On [Kalshi](https://kalshi.com/markets/kxnobelecon/nobel-economics-prize/kxnobelecon-26), yesterday's story reversed. Pakes, who closed Sunday at 32 after a 500-contract buy, was sold hard in the US morning: 200 contracts at 35, 136 at 30, 50 at 24. Buyers came back in the afternoon and printed 35 again, and his last trade is 26 on a 17-bid, 23-ask book. Athey was the busiest name on the market, 58 trades in a day, bought from 19 up to 26 in small lots and then sold back to 20 on 150- and 80-contract hits. Her open interest, 2,725 contracts, is now the largest on the board; Pakes has slipped to second. Blundell printed 15 on 64 contracts, a thin trade on a thin book. Barro took a 200-contract buy at 12 and a 34-contract print at 18, then settled at 12. The odd position of the day belongs to [Luigi Zingales](/candidates/luigi-zingales/): about 1,400 contracts bought at 4 and 5 cents, including two 500-lots, on the day Polymarket opened. His last trade is 3, but his open interest, 2,152, is now third on the board. Somebody wants a lot of a cheap ticket. And yesterday's 500-lot on [Andreu Mas-Colell](/candidates/andreu-mas-colell/) at 6 was answered today by a 200-contract sale at 1. Polymarket, for what it is worth, has him at 8.

**Six new sources.** The board read eight sources through Sunday; from today it reads fifteen. The new ones, with the weight we give each:

- **[Richard Tol's model](https://richardtol.substack.com/p/2026-nobel-memorial-prize)** (weight 1.5). A statistical reconstruction of every past prize, scoring 161 living economists on citations, coauthorship with earlier laureates and the historical rotation between fields. It is the only source here that models the committee rather than the economists. It says the 2026 prize goes to information economics, game theory, development or economic history, and lists a top ten led by [Sanford Grossman](/candidates/sanford-grossman/) at 4.4 percent, [Barry Eichengreen](/candidates/barry-eichengreen/), Barro, [Drew Fudenberg](/candidates/drew-fudenberg/), [Gene Grossman](/candidates/gene-grossman/), [Tim Besley](/candidates/tim-besley/), [David Weil](/candidates/david-weil/), [Kevin Murphy](/candidates/kevin-murphy/), [Kenneth French](/candidates/kenneth-french/) and [Gilles Saint-Paul](/candidates/gilles-saint-paul/) at 2.1 percent. Barro is the only name on that list in the top five of either market. Tol also notes that Anna Dreber fronts the committee this year, which he reads as a point for a [Camerer](/candidates/colin-camerer/)-[Loewenstein](/candidates/george-loewenstein/) prize.
- **[Prophet Arena](https://www.prophetarena.co/events/KXNOBELECON-26)** (weight 1.5). Ten frontier language models each forecast the nine Kalshi names from one shared research briefing, and the site averages them. The consensus is Athey 37.7 percent and Pakes 20.6, the reverse of the money. The machines back Athey where the markets back Pakes, and the gap is the most interesting number on the board this week.
- **[Octagon AI](https://www.octagonai.co/markets/science-and-technology/physics-math/nobel-prize-in-economics-2026)** (weight 0.5). A single model, undisclosed method, last updated July 28, which puts Pakes first at 7.5 percent and gives four of the nine Kalshi names zero. Stale, so it carries little weight, but it is a second machine opinion and it disagrees with the first.
- **[Scott Cunningham](https://causalinf.substack.com/p/nobel-prize-predictions-for-the-wages)** (weight 1.5). An annual ranked list, published every October since 2021, behind a paywall. His September 28 list, as Tol reported it, leads with Autor and Katz for skill-biased technological change, perhaps with Murphy, and keeps [Steven Berry](/candidates/steven-berry/), [James Levinsohn](/candidates/james-levinsohn/) and Pakes as the backup. He posted an update on October 1 that we could not read; a research pass on Sunday read it as adding Athey and Chernozhukov in second place, and until we can confirm that, the board carries the September list.
- **[Nicholas Decker](https://x.com/captgouda24/status/2106842872351703300)** (weight 1). One confident prediction a year, with an essay behind it. On October 4 he wrote that he was confident enough in [Timothy Bresnahan](/candidates/timothy-bresnahan/), Berry and Pakes to write the article in advance. Last year he named Berry, Hausman and Pakes, then added that the committee would instead go to Aghion and Howitt, which it did.
- **Maia Mindel** (weight 0.5). Berry, Bresnahan, Levinsohn and Pakes, from a thread on X that we have only secondhand, from a roundup. The weight reflects that.
- **[Tomas Bata University](https://fame.utb.cz/en/news-events/who-will-win-the-nobel-prize-in-economic-sciences-this-year/)** (weight 0.5). The Zlin economics department's annual guessing game, parallel to HSE's. Entries by email through October 11; the tally comes with the prize, and the source enters the board then.

Three things we looked at and did not add. Manifold has no per-candidate market this year, only a binary on whether a US citizen wins, at 86 percent. Farhad Panahov runs an open survey that publishes no counts. And no UK bookmaker has posted an economics market, which is why the Ladbrokes line on our board is still empty.

**What it does to the Power Rankings.** For the first time this season, Pakes leads: 30.5 to Athey's 28.6. Eight sources now name him to her five. Berry jumps from eleventh to third on three forecasters and no market. Woodford, Varian and Winter hold fourth through sixth on Clarivate plus their new Polymarket prices. Barro is seventh, the only economist on a market, a model and a forecaster's list at once. Katz and Autor are eighth and ninth. Below the line, Bresnahan and Sanford Grossman enter at fifteenth from nowhere, Eichengreen at nineteenth, Fudenberg at twenty-first, and Blundell and Dasgupta fall to thirteenth and fourteenth as the denominator grows. Adding sources mid-season moves the board, and that is the point: the [replay](/replay/) keeps every earlier snapshot, and on Monday every source gets a grade.

The prize is announced Monday, October 12, at 11:45 CEST at the earliest, the last of the [2026 announcements](https://www.nobelprize.org/press-release/the-2026-nobel-prize-announcements/).
