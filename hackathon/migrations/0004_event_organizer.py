# Generated by Django 3.0.3 on 2020-05-03 03:12

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('hackathon', '0003_grade_criteria'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='organizer',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, related_name='event_organizer', to=settings.AUTH_USER_MODEL),
        ),
    ]
