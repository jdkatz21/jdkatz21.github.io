---
layout: archive
title: "Data Visualizations"
permalink: /dataviz/
---

<!-- Optional: add content or include the list of visualizations -->

I like sharing the things that I think are cool. My hope is that you might also think they're cool, and so I like spending time on fun visualizations that might convince you. I also hope that you will recognize that these visualizations are not too hard to make, and they can make concepts stick much better!

Take a look at some of the things I've made. All of the code to replicate these entirely locally are available on my GitHub in my data_visualizations project.

## Interactive Yield Curve (will take a second to load)
At the Fed, I deal a lot with treasury yields. One thing I realized is that there really isn't a good source on the internet to play around with the yield curve (FRED only has timeseries of yield spreads) that isn't ridden with ads or popups. So I made one! It's pretty fun to look at what treasury yields were up to on any important day of your life (they say yield spreads are the window to one's soul...). It's fun to see how the yield curve jumps in response to big economic events, and gives an interesting perspective as to how volatile these spreads are.

<iframe src="https://jareddeankatz.shinyapps.io/yield_curve_shiny/" 
        width="600px" 
        height="600px" 
        style="border:none;">
</iframe>

## Brownian motions are the limit of random walks
We write models in continuous time so we can use the tools of calculus to solve them. We need brownian motion to write models that incorporate randomness in continuous time. But did you know that a brownian motion is the limit of a random walk, just like integrals are the limit of Riemann sums? They also have some other fun properties: the location of a brownian motion at time t is a normal distribution with mean 0, variance t; motions will cross over the x-axis infinitely many times if you give it enough time; the best predictor for where a motion will be tomorrow is its position today (the martingale property). Play around with the visualization below to see some of these properties paying off.

<iframe src="/dataviz/brownian_motion.html" width="110%" height="600px" frameborder="0"></iframe>
