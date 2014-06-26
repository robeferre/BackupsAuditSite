from django.conf.urls import patterns, url
from backups_app import settings 

urlpatterns = patterns('',
                       
    ################
    ## Login URL's
    ################
    
    #Django Login
    url(r'^$', 'backups_app_site.views.login', name='login'),
    url(r'^login/$', 'backups_app_site.views.login', name='login'),
    
    # IDX LOGIN
    #url(r'^$', 'TSM_APP.views.login', name='login'),
    #url(r'^login/$', 'TSM_APP.views.login', name='login'),
    
    
    url(r'^home/$', 'backups_app_site.views.home', name='home'),

)

# Serve static contend
if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^static_media/(?P<path>.*)$', 'django.views.static.serve',
             {'document_root': settings.MEDIA_ROOT}),
    )