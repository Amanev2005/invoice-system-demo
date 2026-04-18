from django.http import HttpResponse

def test_export(request):
    response = HttpResponse("test", content_type='text/plain')
    return response
