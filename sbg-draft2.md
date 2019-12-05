sbg:draft2 and Rabix Executor
=============================

`sbg:draft2` is a legacy version of the CWL specification. The only executor 
that runs this legacy version outside of any Seven Bridges platform is Rabix Executor. 
While Rabix Executor is a fully functional executor sutable for testing `sbg:draft2`
workflows locally, the code is no longer maintained. In addition, Rabix Executor 
does not run properly on Windows. 

For convenience, Rabix Executor is bundled with Rabix Composer and can be used to
test run `sbg:draft2` tools and workflows. It is strongly reccomended that you 
update any still used `sbg:draft2` tools and workflows to at least CWL 1.0. 

The [SB draft2 upgrader tool](https://github.com/sbg/sevenbridges-cwl-draft2-upgrader) 
can help with the updating.
